import React, { useEffect, useReducer, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { fetchAuthSession, fetchUserAttributes } from "@aws-amplify/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Gift,
  Heart,
  Lock,
  MessageCircle,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { fetchBackend } from "@/lib/db";
import { checkMembership } from "@/lib/membership";
import { ensureAuthenticatedUser, getAuthenticatedUser } from "@/lib/user";
import { getQueryString } from "@/util/url";
import PageLoadingState from "@/components/Common/PageLoadingState";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { MEMBERSHIP_FORM_DEFAULTS } from "@/components/SignUpForm/membershipFormSchema";
import { onboardingValidationSchema } from "@/components/SignUpForm/onboardingFormSchema";
import type { MembershipFormValues } from "@/components/SignUpForm/MembershipFormSection";

const faculties = [
  "Arts",
  "Commerce",
  "Science",
  "Engineering",
  "Kinesiology",
  "Land and Food Systems",
  "Forestry",
  "Other",
  "Not Applicable",
];
const topics = [
  "Careers in Tech",
  "Startups",
  "AI",
  "E-commerce",
  "Cybersecurity",
  "Health Tech",
];
const diets = ["Vegetarian", "Vegan", "Gluten-free", "Halal", "Kosher", "None"];
const referralSources = ["Word of Mouth", "Instagram", "Website", "Other"];
const stepFields: (keyof MembershipFormValues)[][] = [
  [],
  [
    "firstName",
    "lastName",
    "studentNumber",
    "pronouns",
    "pronounsOther",
    "email",
    "linkedIn",
  ],
  [
    "education",
    "studentNumber",
    "levelOfStudy",
    "levelOfStudyOther",
    "faculty",
    "major",
    "internationalStudent",
  ],
  ["topics", "dietaryRestrictions"],
  ["previousMember", "referral"],
];

type FlowState = { step: number; direction: number };
type FlowAction =
  | { type: "next" }
  | { type: "go"; step: number }
  | { type: "complete" };
function flowReducer(state: FlowState, action: FlowAction): FlowState {
  if (action.type === "next")
    return { step: Math.min(5, state.step + 1), direction: 1 };
  if (action.type === "complete") return { step: 6, direction: 1 };
  return { step: action.step, direction: action.step < state.step ? -1 : 1 };
}

const animation = {
  initial: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -18 }),
};

export default function Onboarding() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasMembership, setHasMembership] = useState(false);
  const [{ step, direction }, dispatch] = useReducer(flowReducer, {
    step: 0,
    direction: 1,
  });
  const redirected = useRef(false);
  const methods = useForm<MembershipFormValues>({
    resolver: zodResolver(onboardingValidationSchema),
    defaultValues: MEMBERSHIP_FORM_DEFAULTS,
    mode: "onTouched",
  });
  const { reset } = methods;

  useEffect(() => {
    if (!router.isReady) return;
    let cancelled = false;
    async function initialize() {
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.accessToken) throw new Error("Unauthenticated");
        const attributes = await fetchUserAttributes();
        if (!attributes.email) throw new Error("Missing email");
        const membershipPromise = checkMembership(attributes.email).catch(
          () => false,
        );
        await ensureAuthenticatedUser();
        const [user, profile, membershipStatus] = await Promise.all([
          getAuthenticatedUser(),
          fetchBackend({ endpoint: "/profiles/user/", method: "GET" }).catch(
            () => null,
          ),
          membershipPromise,
        ]);
        if (cancelled) return;
        const savedPronouns = profile?.pronouns ?? user.gender ?? "";
        const savedLevelOfStudy = profile?.year ?? user.year ?? "";
        const standardPronouns = ["He/Him", "She/Her", "They/Them"];
        const standardLevels = ["Undergraduate", "Graduate", "Post-doc"];

        reset({
          ...MEMBERSHIP_FORM_DEFAULTS,
          email: attributes.email,
          firstName: user.fname ?? profile?.fname ?? "",
          lastName: user.lname ?? profile?.lname ?? "",
          studentNumber:
            user.studentId === undefined ? "" : String(user.studentId),
          education: user.education ?? "",
          pronouns: standardPronouns.includes(savedPronouns)
            ? savedPronouns
            : savedPronouns
              ? "Other"
              : "",
          pronounsOther: standardPronouns.includes(savedPronouns)
            ? ""
            : savedPronouns,
          linkedIn: profile?.linkedIn ?? "",
          levelOfStudy: standardLevels.includes(savedLevelOfStudy)
            ? savedLevelOfStudy
            : savedLevelOfStudy
              ? "Other"
              : "",
          levelOfStudyOther: standardLevels.includes(savedLevelOfStudy)
            ? ""
            : savedLevelOfStudy,
          faculty: user.faculty ?? "",
          major: user.major ?? profile?.major ?? "",
          internationalStudent:
            typeof user.international === "boolean"
              ? user.international
                ? "Yes"
                : "No"
              : "",
          previousMember:
            typeof user.prevMember === "boolean"
              ? user.prevMember
                ? "Yes"
                : "No"
              : "",
          dietaryRestrictions: user.diet ?? "None",
          referral: referralSources.includes(user.referral ?? "")
            ? (user.referral ?? "")
            : user.referral
              ? "Other"
              : "",
          topics: Array.isArray(user.topics) ? user.topics : [],
        });
        setHasMembership(membershipStatus);
        if (!cancelled) setLoading(false);
      } catch {
        if (!redirected.current) {
          redirected.current = true;
          await router.replace("/login");
        }
      }
    }
    initialize();
    const safety = window.setTimeout(() => setLoading(false), 8000);
    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, [router, reset]);

  async function next() {
    const fields = stepFields[step];
    if (fields?.length && !(await methods.trigger(fields))) {
      if (step === 2 && methods.getFieldState("studentNumber").invalid) {
        dispatch({ type: "go", step: 1 });
      }
      return;
    }
    dispatch({ type: "next" });
  }

  const submit = methods.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await fetchBackend({
        endpoint: "/profiles",
        method: "POST",
        data: {
          ...values,
          pronouns:
            values.pronouns === "Other"
              ? values.pronounsOther.trim()
              : values.pronouns,
          levelOfStudy:
            values.levelOfStudy === "Other"
              ? values.levelOfStudyOther.trim()
              : values.levelOfStudy,
        },
      });
      dispatch({ type: "complete" });
    } catch (error) {
      console.error("Error during onboarding submission:", error);
      toast({
        variant: "destructive",
        title: "We couldn't save your profile. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  });

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PageLoadingState />
      </div>
    );
  return (
    <FormProvider {...methods}>
      <Toaster />
      <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#111a30] to-[#1b253d] text-[#f7faff]">
        {step > 0 && <Brand />}
        <div className="mx-auto flex min-h-screen w-full max-w-[920px] items-center justify-center px-5 py-20 sm:px-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.section
              key={step}
              custom={direction}
              variants={animation}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="w-full"
            >
              {step === 0 ? (
                <Welcome onStart={() => dispatch({ type: "go", step: 1 })} />
              ) : step === 6 ? (
                <Complete
                  hasMembership={hasMembership}
                  onHome={() =>
                    window.location.assign(
                      getQueryString(router.query.redirect) ?? "/",
                    )
                  }
                  onMembership={() => router.push("/membership")}
                />
              ) : (
                <div className="mx-auto w-full max-w-[856px]">
                  <Progress
                    step={step + 1}
                    onBack={(target) =>
                      dispatch({ type: "go", step: target - 1 })
                    }
                  />
                  <div className="mt-9">
                    {step === 1 && <ProfileStep />}
                    {step === 2 && <AcademicStep />}
                    {step === 3 && <PreferencesStep />}
                    {step === 4 && <HistoryStep />}
                  </div>
                  <div className="mt-9 flex justify-center gap-3">
                    <SecondaryButton
                      onClick={() =>
                        dispatch({ type: "go", step: Math.max(0, step - 1) })
                      }
                      disabled={submitting}
                    >
                      Back
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={step === 4 ? submit : next}
                      disabled={submitting}
                    >
                      {submitting ? "Saving..." : "Continue"}
                    </PrimaryButton>
                  </div>
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>
    </FormProvider>
  );
}

function Brand() {
  return (
    <div className="absolute left-5 top-5 z-10 flex items-center gap-2 sm:left-10 sm:top-8">
      <Image
        src="/assets/biztech_logo.svg"
        alt="UBC BizTech"
        width={30}
        height={30}
      />
      <span className="hidden text-base font-semibold sm:block">
        UBC BizTech
      </span>
    </div>
  );
}
function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-[600px] flex-col items-center text-center">
      <Image
        src="/assets/onboarding/bizbot-face.png"
        alt="BizBot"
        width={124}
        height={107}
        priority
      />
      <h1 className="mt-6 text-[32px] font-semibold leading-tight sm:text-[36px]">
        Welcome to UBC BizTech
      </h1>
      <p className="mt-4 text-[16px]">
        Just a few quick questions and you&apos;re in!
      </p>
      <PrimaryButton
        className="mt-6 !px-7 !py-2.5 !text-[16px]"
        onClick={onStart}
      >
        Get started
      </PrimaryButton>
    </div>
  );
}

const progressIcons = [
  UserRound,
  Lock,
  BookOpen,
  MessageCircle,
  Settings,
  Check,
];
function Progress({
  step,
  onBack,
}: {
  step: number;
  onBack: (step: number) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[560px] px-4">
      <div className="relative flex items-start justify-between">
        <div className="absolute left-3 right-3 top-[12px] h-0.5 rounded bg-[#1b2540]" />
        <div
          className="absolute left-3 top-[12px] h-0.5 rounded bg-[#3b9ff7] transition-all duration-300"
          style={{ width: `calc((100% - 24px) * ${(step - 1) / 5})` }}
        />
        {progressIcons.map((Icon, index) => {
          const node = index + 1;
          const done = node <= step;
          const clickable = node < step && step < 6;
          return (
            <button
              key={node}
              type="button"
              aria-label={`Go back to onboarding step ${node}`}
              disabled={!clickable}
              onClick={() => clickable && onBack(node)}
              className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border transition ${done ? "border-[#3b9ff7] bg-[#3b9ff7] text-white" : "border-[#33415f] bg-[#1b253d] text-[#7282a8]"} ${clickable ? "cursor-pointer hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b9ff7]" : "cursor-default"}`}
            >
              <Icon size={12} strokeWidth={2.3} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-7 text-center text-[28px] font-semibold leading-tight sm:text-[34px]">
      {children}
    </h1>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[14px] font-medium">{children}</label>
  );
}
function ErrorText({ name }: { name: keyof MembershipFormValues }) {
  const { formState } = useFormContext<MembershipFormValues>();
  const message = formState.errors[name]?.message;
  return message ? (
    <p className="mt-1 text-[13px] text-[#ff8a9e]">{String(message)}</p>
  ) : null;
}
const fieldClass =
  "h-11 w-full rounded-md border border-[#3b4866] bg-[#26324d] px-3.5 text-[14px] text-white outline-none transition placeholder:text-[#a2b1d5] focus:border-[#3b9ff7] focus:ring-2 focus:ring-[#3b9ff7]/20";
function TextField({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
  maxLength,
  inputMode,
}: {
  name: keyof MembershipFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const { register } = useFormContext<MembershipFormValues>();
  return (
    <div>
      {label && <Label>{label}</Label>}
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        readOnly={disabled}
        aria-readonly={disabled}
        maxLength={maxLength}
        inputMode={inputMode}
        className={`${fieldClass} ${disabled ? "cursor-not-allowed !border-[#303b55] !bg-[#182238] !text-[#8d9ab9] opacity-75" : ""}`}
      />
      <ErrorText name={name} />
    </div>
  );
}
function SelectField({
  name,
  label,
  options,
  placeholder,
}: {
  name: keyof MembershipFormValues;
  label: string;
  options: string[];
  placeholder: string;
}) {
  const { register } = useFormContext<MembershipFormValues>();
  return (
    <div>
      <Label>{label}</Label>
      <select {...register(name)} className={fieldClass} defaultValue="">
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ErrorText name={name} />
    </div>
  );
}
function Pills({
  name,
  options,
  values = options,
  multiple = false,
}: {
  name: keyof MembershipFormValues;
  options: string[];
  values?: string[];
  multiple?: boolean;
}) {
  const { setValue, watch } = useFormContext<MembershipFormValues>();
  const value = watch(name);
  const selected = Array.isArray(value) ? value : [value];
  function choose(option: string, index: number) {
    const stored = values[index];
    if (multiple) {
      const current = Array.isArray(value) ? (value as string[]) : [];
      const next = current.includes(stored)
        ? current.filter((v) => v !== stored)
        : [...current, stored];
      setValue(name, next as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else
      setValue(name, stored as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
  }
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => choose(option, index)}
          className={`rounded-full border px-4 py-2 text-[14px] font-medium leading-5 transition ${selected.includes(values[index]) ? "border-[#3b9ff7] bg-[#3b9ff7] text-white" : "border-[#3b4866] bg-[#26324d] text-[#f7faff] hover:border-[#7282a8]"}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function ProfileStep() {
  const { watch } = useFormContext<MembershipFormValues>();
  return (
    <div className="mx-auto max-w-[560px]">
      <Heading>Create your profile</Heading>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="firstName"
          label="First Name"
          placeholder="First Name"
        />
        <TextField name="lastName" label="Last Name" placeholder="Last Name" />
      </div>
      <div className="mt-4">
        <TextField
          name="studentNumber"
          label="Student Number"
          placeholder="12345678"
          maxLength={8}
          inputMode="numeric"
        />
      </div>
      <div className="mt-4">
        <Label>Pronouns</Label>
        <Pills
          name="pronouns"
          options={["He/Him", "She/Her", "They/Them", "Other"]}
        />
        <ErrorText name="pronouns" />
        {watch("pronouns") === "Other" && (
          <div className="mt-2.5">
            <TextField
              name="pronounsOther"
              label=""
              placeholder="Please specify your pronouns"
            />
          </div>
        )}
      </div>
      <div className="mt-4">
        <TextField name="email" label="Email Address" type="email" disabled />
      </div>
      <div className="mt-4">
        <TextField
          name="linkedIn"
          label="LinkedIn"
          placeholder="https://www.linkedin.com/in/your-profile/"
        />
      </div>
    </div>
  );
}
function AcademicStep() {
  const { watch } = useFormContext<MembershipFormValues>();
  return (
    <div>
      <Heading>Your academic details</Heading>
      <div className="mx-auto max-w-[600px] space-y-4">
        <div>
          <Label>Education</Label>
          <Pills
            name="education"
            options={[
              "I’m a UBC student",
              "I’m a university student",
              "Not Applicable",
            ]}
            values={["UBC", "UNI", "NA"]}
          />
          <ErrorText name="education" />
        </div>
        <div>
          <Label>Level of Study</Label>
          <Pills
            name="levelOfStudy"
            options={["Undergraduate", "Graduate", "Post-doc", "Other"]}
          />
          <ErrorText name="levelOfStudy" />
          {watch("levelOfStudy") === "Other" && (
            <div className="mt-2.5">
              <TextField
                name="levelOfStudyOther"
                label=""
                placeholder="Please specify your level of study"
              />
            </div>
          )}
        </div>
        <SelectField
          name="faculty"
          label="Faculty"
          options={faculties}
          placeholder="Select your faculty"
        />
        <TextField
          name="major"
          label="Major"
          placeholder="e.g. Computer Science"
        />
        <div>
          <Label>Are you an international student?</Label>
          <Pills name="internationalStudent" options={["Yes", "No"]} />
          <ErrorText name="internationalStudent" />
        </div>
      </div>
    </div>
  );
}
function PreferencesStep() {
  return (
    <div>
      <Heading>What do you want to nerd out about?</Heading>
      <div className="flex justify-center">
        <Pills name="topics" options={topics} multiple />
      </div>
      <ErrorText name="topics" />
      <h2 className="mb-4 mt-12 text-center text-[26px] font-semibold sm:text-[30px]">
        Any dietary restrictions?
      </h2>
      <div className="flex justify-center">
        <Pills name="dietaryRestrictions" options={diets} />
      </div>
      <ErrorText name="dietaryRestrictions" />
    </div>
  );
}
function HistoryStep() {
  const { setValue, watch } = useFormContext<MembershipFormValues>();
  const previous = watch("previousMember");
  return (
    <div>
      <Heading>Were you a BizTech member last year?</Heading>
      <div className="mx-auto grid max-w-[800px] gap-3 sm:grid-cols-2">
        {[
          ["Yes", "Yes, I was!"],
          ["No", "No, this is my first time"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              setValue("previousMember", value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            className={`flex h-16 items-center justify-between rounded-lg border px-5 text-left text-base ${previous === value ? "border-[#3b9ff7] bg-[#26324d]" : "border-[#3b4866] bg-[#1b253d]"}`}
          >
            <span>{label}</span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${previous === value ? "border-[#3b9ff7] bg-[#3b9ff7]" : "border-[#7282a8]"}`}
            >
              {previous === value && <Check size={12} />}
            </span>
          </button>
        ))}
      </div>
      <ErrorText name="previousMember" />
      {previous === "Yes" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-4 flex max-w-[800px] items-center gap-3 rounded-lg border border-[#3b4866] bg-[#26324d] p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#3b9ff7]/15 text-[#3b9ff7]">
            <Heart size={20} />
          </span>
          <div>
            <h3 className="text-base font-semibold">Welcome back! 👋</h3>
            <p className="text-[14px] text-[#d8e1f5]">
              We&apos;re so thrilled to have you with us again :)
            </p>
          </div>
        </motion.div>
      )}
      <div className="mx-auto mt-4 max-w-[800px]">
        <SelectField
          name="referral"
          label="How did you hear about us?"
          options={referralSources}
          placeholder="Select a referral source"
        />
      </div>
    </div>
  );
}
function Complete({
  hasMembership,
  onHome,
  onMembership,
}: {
  hasMembership: boolean;
  onHome: () => void;
  onMembership: () => void;
}) {
  const price = process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? "10";
  return (
    <div className="relative mx-auto max-w-[760px] text-center">
      <Sparkles
        className="absolute left-[8%] top-10 text-[#3b9ff7]"
        size={42}
      />
      <Sparkles
        className="absolute right-[8%] top-24 text-[#75d450]"
        size={58}
      />
      <Progress step={6} onBack={() => undefined} />
      <Image
        className="mx-auto mt-9"
        src="/assets/onboarding/bizbot-face.png"
        alt="Celebrating BizBot"
        width={112}
        height={98}
      />
      <h1 className="mt-6 text-[36px] font-semibold sm:text-[44px]">
        You&apos;re all set!
      </h1>
      <p className="mt-3 text-base">
        Welcome to BizTech! You can now browse our events and resources.
      </p>
      {!hasMembership && (
        <div className="mt-9 flex flex-col items-center gap-4 rounded-lg border border-[#3b4866] bg-[#26324d] p-5 text-left sm:flex-row">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#75d450]/15 text-[#75d450]">
            <Gift size={20} />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Get full access</h2>
            <p className="mt-1 text-[14px] text-[#d8e1f5]">
              Get a BizTech membership for ${price} to unlock all exclusive
              perks.
            </p>
          </div>
          <PrimaryButton onClick={onMembership}>Become a member</PrimaryButton>
        </div>
      )}
      <PrimaryButton className="mt-9" onClick={onHome}>
        Go to home
      </PrimaryButton>
    </div>
  );
}
function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-md bg-[#3b93f7] px-5 py-2 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#147fdd] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`rounded-md border border-[#3b4866] bg-[#1b253d] px-5 py-2 text-[14px] font-semibold text-[#d8e1f5] transition hover:border-[#7282a8] hover:bg-[#26324d] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
