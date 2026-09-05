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
        await ensureAuthenticatedUser();
        const [user, profile] = await Promise.all([
          getAuthenticatedUser(),
          fetchBackend({ endpoint: "/profiles/user/", method: "GET" }).catch(
            () => null,
          ),
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
          referral: user.referral ?? "",
          topics: Array.isArray(user.topics) ? user.topics : [],
        });
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
        <div className="mx-auto flex min-h-screen w-full max-w-[1000px] items-center justify-center px-5 py-28 sm:px-8">
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
                  onHome={() =>
                    window.location.assign(
                      getQueryString(router.query.redirect) ?? "/",
                    )
                  }
                  onMembership={() => router.push("/membership")}
                />
              ) : (
                <div className="mx-auto w-full max-w-[900px]">
                  <Progress
                    step={step + 1}
                    onBack={(target) =>
                      dispatch({ type: "go", step: target - 1 })
                    }
                  />
                  <div className="mt-12">
                    {step === 1 && <ProfileStep />}
                    {step === 2 && <AcademicStep />}
                    {step === 3 && <PreferencesStep />}
                    {step === 4 && <HistoryStep />}
                  </div>
                  <div className="mt-12 flex justify-center">
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
    <div className="absolute left-5 top-6 z-10 flex items-center gap-3 sm:left-10 sm:top-10">
      <Image
        src="/assets/biztech_logo.svg"
        alt="UBC BizTech"
        width={50}
        height={50}
      />
      <span className="hidden text-2xl font-semibold sm:block">
        UBC BizTech
      </span>
    </div>
  );
}
function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto flex max-w-[715px] flex-col items-center text-center">
      <Image
        src="/assets/onboarding/bizbot-face.png"
        alt="BizBot"
        width={179}
        height={155}
        priority
      />
      <h1 className="mt-6 text-[40px] font-semibold leading-tight sm:text-5xl">
        Welcome to UBC BizTech
      </h1>
      <p className="mt-6 text-xl sm:text-2xl">
        Just a few quick questions and you&apos;re in!
      </p>
      <PrimaryButton className="mt-6" onClick={onStart}>
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
    <div className="mx-auto w-full max-w-[600px] px-5">
      <div className="relative flex items-start justify-between">
        <div className="absolute left-4 right-4 top-[14px] h-1 rounded bg-[#1b2540]" />
        <div
          className="absolute left-4 top-[14px] h-1 rounded bg-[#3b9ff7] transition-all duration-300"
          style={{ width: `calc((100% - 32px) * ${(step - 1) / 5})` }}
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
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border transition ${done ? "border-[#3b9ff7] bg-[#3b9ff7] text-white" : "border-[#33415f] bg-[#1b253d] text-[#7282a8]"} ${clickable ? "cursor-pointer hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b9ff7]" : "cursor-default"}`}
            >
              <Icon size={14} strokeWidth={2.3} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-8 text-center text-[34px] font-semibold leading-tight sm:text-[40px]">
      {children}
    </h1>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-2 block text-base font-medium">{children}</label>;
}
function ErrorText({ name }: { name: keyof MembershipFormValues }) {
  const { formState } = useFormContext<MembershipFormValues>();
  const message = formState.errors[name]?.message;
  return message ? (
    <p className="mt-1 text-sm text-[#ff8a9e]">{String(message)}</p>
  ) : null;
}
const fieldClass =
  "h-12 w-full rounded-lg border border-[#3b4866] bg-[#26324d] px-4 text-base text-white outline-none transition placeholder:text-[#a2b1d5] focus:border-[#3b9ff7] focus:ring-2 focus:ring-[#3b9ff7]/20";
function TextField({
  name,
  label,
  type = "text",
  placeholder,
  disabled,
}: {
  name: keyof MembershipFormValues;
  label: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
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
        className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-70`}
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
    <div className="flex flex-wrap gap-2.5">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          onClick={() => choose(option, index)}
          className={`rounded-full border px-5 py-2.5 text-base font-medium transition ${selected.includes(values[index]) ? "border-[#3b9ff7] bg-[#3b9ff7] text-white" : "border-[#3b4866] bg-[#26324d] text-[#f7faff] hover:border-[#7282a8]"}`}
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
    <div className="mx-auto max-w-[600px]">
      <Heading>Create your profile</Heading>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          name="firstName"
          label="First Name"
          placeholder="First Name"
        />
        <TextField name="lastName" label="Last Name" placeholder="Last Name" />
      </div>
      <div className="mt-5">
        <TextField
          name="studentNumber"
          label="Student Number"
          placeholder="12345678"
        />
      </div>
      <div className="mt-5">
        <Label>Pronouns</Label>
        <Pills
          name="pronouns"
          options={["He/Him", "She/Her", "They/Them", "Other"]}
        />
        <ErrorText name="pronouns" />
        {watch("pronouns") === "Other" && (
          <div className="mt-3">
            <TextField
              name="pronounsOther"
              label=""
              placeholder="Please specify your pronouns"
            />
          </div>
        )}
      </div>
      <div className="mt-5">
        <TextField name="email" label="Email Address" type="email" disabled />
      </div>
      <div className="mt-5">
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
      <div className="mx-auto max-w-[600px] space-y-5">
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
            <div className="mt-3">
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
      <h2 className="mb-5 mt-16 text-center text-3xl font-semibold">
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
  const { setValue, watch, register } = useFormContext<MembershipFormValues>();
  const previous = watch("previousMember");
  return (
    <div>
      <Heading>Were you a BizTech member last year?</Heading>
      <div className="mx-auto grid max-w-[856px] gap-4 sm:grid-cols-2">
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
            className={`flex h-20 items-center justify-between rounded-xl border px-6 text-left text-lg ${previous === value ? "border-[#3b9ff7] bg-[#26324d]" : "border-[#3b4866] bg-[#1b253d]"}`}
          >
            <span>{label}</span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${previous === value ? "border-[#3b9ff7] bg-[#3b9ff7]" : "border-[#7282a8]"}`}
            >
              {previous === value && <Check size={14} />}
            </span>
          </button>
        ))}
      </div>
      <ErrorText name="previousMember" />
      {previous === "Yes" && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-6 flex max-w-[856px] items-center gap-4 rounded-xl border border-[#3b4866] bg-[#26324d] p-5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#3b9ff7]/15 text-[#3b9ff7]">
            <Heart />
          </span>
          <div>
            <h3 className="text-lg font-semibold">Welcome back! 👋</h3>
            <p className="text-base text-[#d8e1f5]">
              We&apos;re so thrilled to have you with us again :)
            </p>
          </div>
        </motion.div>
      )}
      <div className="mx-auto mt-6 max-w-[866px]">
        <Label>How did you hear about us?</Label>
        <input
          {...register("referral")}
          className={fieldClass}
          placeholder="e.g. Instagram, friend, event, etc."
        />
        <ErrorText name="referral" />
      </div>
    </div>
  );
}
function Complete({
  onHome,
  onMembership,
}: {
  onHome: () => void;
  onMembership: () => void;
}) {
  const price = process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE ?? "10";
  return (
    <div className="relative mx-auto max-w-[800px] text-center">
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
        className="mx-auto mt-12"
        src="/assets/onboarding/bizbot-face.png"
        alt="Celebrating BizBot"
        width={160}
        height={140}
      />
      <h1 className="mt-8 text-5xl font-semibold sm:text-6xl">
        You&apos;re all set!
      </h1>
      <p className="mt-5 text-lg sm:text-xl">
        Welcome to BizTech! You can now browse our events and resources.
      </p>
      <div className="mt-12 flex flex-col items-center gap-5 rounded-xl border border-[#3b4866] bg-[#26324d] p-6 text-left sm:flex-row">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#75d450]/15 text-[#75d450]">
          <Gift />
        </span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Get full access</h2>
          <p className="mt-1 text-base text-[#d8e1f5]">
            Get a BizTech membership for ${price} to unlock all exclusive perks.
          </p>
        </div>
        <PrimaryButton onClick={onMembership}>Become a member</PrimaryButton>
      </div>
      <PrimaryButton className="mt-12" onClick={onHome}>
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
      className={`rounded-lg bg-[#3b93f7] px-7 py-2.5 text-base font-semibold text-white shadow-sm transition hover:bg-[#147fdd] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
