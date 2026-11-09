import { useEffect, useId, useReducer, useRef, useState } from "react";
import Head from "next/head";
import { PartnerRegistrationComplete } from "./PartnerRegistrationComplete";
import { ArrowLeft, ArrowRight, Pencil } from "lucide-react";
import { ChoiceField } from "./components/ChoiceField";
import { FileUploadField } from "./components/FileUploadField";
import {
  QuestionField,
  type QuestionControlProps,
} from "./components/QuestionField";
import { formatPartnerExpertise } from "./partner";
import styles from "./PartnerRegistrationForm.module.css";
import { PARTNER_LINKEDIN_PREFIX, normalizePartnerLinkedin } from "./linkedin";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AREAS_OF_EXPERTISE,
  DIETARY_OPTIONS,
  PRONOUNS,
  blueprintPartnerRegistrationSchema,
  blueprintHeadshotSchema,
  type BluePrintPartnerRegistrationValues,
} from "./Definition";
import {
  PARTNER_GROUPS,
  PARTNER_CONTACT_EMAIL,
  PARTNER_QUESTIONS,
  PARTNER_WELCOME,
  partnerFlowReducer,
  partnerQuestionsForGroup,
  type PartnerQuestion,
  type PartnerQuestionField,
} from "./partnerFlow";

type Props =
  | { mode: "preview" }
  | {
      mode: "live";
      onSubmit: (values: BluePrintPartnerRegistrationValues) => Promise<void>;
    };

function WelcomeVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [autoplayAllowed, setAutoplayAllowed] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function applyPreference() {
      setAutoplayAllowed(!preference.matches);
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => {});
    }
    applyPreference();
    preference.addEventListener("change", applyPreference);
    return () => preference.removeEventListener("change", applyPreference);
  }, []);

  return (
    <div className={styles.welcomeMedia}>
      <video
        ref={video}
        src={PARTNER_WELCOME.video}
        poster={PARTNER_WELCOME.poster}
        muted
        loop
        playsInline
        autoPlay={autoplayAllowed}
        aria-hidden="true"
        className={styles.welcomeImage}
      />
    </div>
  );
}

export function BluePrintPartnerRegistrationForm(props: Props) {
  const formId = useId();
  const form = useForm<BluePrintPartnerRegistrationValues>({
    resolver: zodResolver(blueprintPartnerRegistrationSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      nametag: "",
      linkedin: PARTNER_LINKEDIN_PREFIX,
      companyName: "",
      participatingIndependently: false,
      role: "",
      otherPronoun: "",
      areasOfExpertise: [],
      otherExpertise: "",
      otherDietaryRestrictions: "",
      askMeAbout: "",
    },
    shouldFocusError: false,
  });
  const [flow, dispatch] = useReducer(partnerFlowReducer, { kind: "welcome" });
  const [busy, setBusy] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const [direction, setDirection] = useState("forward");
  const heading = useRef<HTMLHeadingElement>(null);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const shell = useRef<HTMLElement>(null);
  const submitLock = useRef(false);
  const nametagCustomized = useRef(false);
  const values = form.watch();
  const headshot = values.headshot;
  const currentGroup =
    flow.kind === "section"
      ? PARTNER_GROUPS.find(({ id }) => id === flow.group)
      : undefined;
  const progressSteps = [...PARTNER_GROUPS, { id: "review", label: "Review" }];
  const currentStepIndex = progressSteps.findIndex(
    ({ id }) => id === (flow.kind === "section" ? flow.group : flow.kind),
  );
  const currentQuestions =
    flow.kind === "section" ? partnerQuestionsForGroup(flow.group) : [];

  useEffect(() => {
    form.register("headshot");
  }, [form]);

  useEffect(() => {
    if (nametagCustomized.current || form.getFieldState("nametag").isDirty)
      return;
    form.setValue(
      "nametag",
      [values.firstName, values.lastName].filter(Boolean).join(" "),
      { shouldDirty: false },
    );
  }, [form, values.firstName, values.lastName]);

  function focusQuestion(field: PartnerQuestionField) {
    shell.current
      ?.querySelector<HTMLElement>(
        `[data-question-field="${field}"] input:not(:disabled), [data-question-field="${field}"] textarea`,
      )
      ?.focus();
  }

  useEffect(() => {
    if (
      flow.kind === "section" ||
      flow.kind === "review" ||
      flow.kind === "complete"
    ) {
      shell.current?.scrollIntoView({ block: "start", behavior: "auto" });
    }
    if (flow.kind === "section") {
      const field =
        flow.mode === "editing"
          ? flow.focusField
          : partnerQuestionsForGroup(flow.group)[0]?.field;
      if (field) {
        shell.current
          ?.querySelector<HTMLElement>(
            `[data-question-field="${field}"] input:not(:disabled), [data-question-field="${field}"] textarea`,
          )
          ?.focus({ preventScroll: flow.mode !== "editing" });
      }
    } else heading.current?.focus({ preventScroll: true });
  }, [flow]);

  useEffect(() => {
    if (
      !(headshot instanceof File) ||
      !blueprintHeadshotSchema.safeParse(headshot).success
    ) {
      setImageUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(headshot);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [headshot]);

  useEffect(() => {
    const element = textarea.current;
    if (!element) return;
    element.style.height = "44px";
    if (values.askMeAbout)
      element.style.height = `${element.scrollHeight + 1}px`;
  }, [values.askMeAbout, flow]);

  async function advance() {
    if (busy || submitLock.current) return;
    if (flow.kind === "welcome") {
      setDirection("forward");
      dispatch({ type: "start" });
      return;
    }
    if (flow.kind === "complete") return;
    form.clearErrors("root");
    submitLock.current = true;
    if (flow.kind === "section") {
      try {
        const valid = await form.trigger(
          currentQuestions.map(({ field }) => field),
        );
        const missingOrganization =
          flow.group === "professional" &&
          !form.getValues("participatingIndependently") &&
          !form.getValues("companyName").trim();
        if (missingOrganization) {
          form.setError("companyName", {
            type: "required",
            message: "Organization name is required",
          });
        }
        if (valid && !missingOrganization) {
          setDirection("forward");
          dispatch({ type: "next" });
        } else {
          const invalid = currentQuestions.find(
            ({ field }) => form.getFieldState(field).error,
          );
          if (invalid) focusQuestion(invalid.field);
        }
      } finally {
        submitLock.current = false;
      }
      return;
    }
    setBusy(true);
    try {
      await form.handleSubmit(
        async (submitted) => {
          if (props.mode === "live") await props.onSubmit(submitted);
          dispatch({ type: "complete" });
        },
        (errors) => {
          const invalid = PARTNER_QUESTIONS.find(({ field }) => errors[field]);
          if (invalid) dispatch({ type: "edit", field: invalid.field });
        },
      )();
    } catch (error) {
      form.setError("root", {
        message:
          error &&
          typeof error === "object" &&
          "message" in error &&
          typeof error.message === "string"
            ? error.message
            : "Unable to submit registration. Please try again.",
      });
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }

  function control(question: PartnerQuestion, common: QuestionControlProps) {
    const inputProps = {
      id: common.id,
      form: formId,
      required: common.required,
      "aria-required": common.required,
      "aria-labelledby": common.labelledBy,
      "aria-describedby": common.describedBy,
      "aria-invalid": common.invalid,
    };
    const choiceProps = { ...common, form: formId };
    switch (question.kind) {
      case "input": {
        if (question.field === "linkedin") {
          return (
            <Input
              {...inputProps}
              {...form.register("linkedin")}
              type="text"
              value={values.linkedin}
              placeholder={question.placeholder}
              onChange={(event) => {
                form.setValue("linkedin", event.target.value, {
                  shouldDirty: true,
                });
              }}
              onPaste={(event) => {
                const pasted = event.clipboardData.getData("text").trim();
                if (
                  !/^(?:https?:\/\/|(?:www\.)?linkedin\.com\/in\/)/i.test(
                    pasted,
                  )
                )
                  return;
                event.preventDefault();
                form.setValue("linkedin", normalizePartnerLinkedin(pasted), {
                  shouldDirty: true,
                });
              }}
              onBlur={(event) => {
                form.setValue(
                  "linkedin",
                  normalizePartnerLinkedin(event.target.value),
                  {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  },
                );
              }}
              autoComplete={question.autoComplete}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={styles.textInput}
            />
          );
        }
        if (question.field === "companyName") {
          return (
            <div className={styles.organization}>
              <Input
                {...inputProps}
                {...form.register("companyName")}
                required={!values.participatingIndependently}
                aria-required={!values.participatingIndependently}
                disabled={values.participatingIndependently}
                autoComplete={question.autoComplete}
                placeholder={question.placeholder}
                className={styles.textInput}
              />
              <label className={styles.independentChoice}>
                <input
                  type="checkbox"
                  {...form.register("participatingIndependently")}
                  onChange={(event) => {
                    form.setValue(
                      "participatingIndependently",
                      event.target.checked,
                      {
                        shouldDirty: true,
                      },
                    );
                    if (event.target.checked) form.clearErrors("companyName");
                    else void form.trigger("companyName");
                  }}
                />
                I’m participating independently
              </label>
            </div>
          );
        }
        const registration = form.register(question.field);
        return (
          <Input
            {...inputProps}
            {...registration}
            onChange={(event) => {
              if (question.field === "nametag")
                nametagCustomized.current = true;
              void registration.onChange(event);
            }}
            type={question.type}
            autoComplete={question.autoComplete}
            placeholder={question.placeholder}
            autoCapitalize={question.type === "url" ? "none" : undefined}
            autoCorrect={question.type === "url" ? "off" : undefined}
            spellCheck={question.type === "url" ? false : undefined}
            className={styles.textInput}
          />
        );
      }
      case "textarea": {
        const registration = form.register(question.field);
        return (
          <textarea
            {...inputProps}
            {...registration}
            ref={(element) => {
              registration.ref(element);
              textarea.current = element;
            }}
            placeholder={question.placeholder}
            rows={1}
            className={`${styles.textInput} ${styles.textarea}`}
          />
        );
      }
      case "multiple-choice":
        return (
          <ChoiceField
            {...choiceProps}
            multiple
            columns={question.columns}
            options={AREAS_OF_EXPERTISE}
            value={values.areasOfExpertise}
            onChange={(value) =>
              form.setValue(question.field, value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            other={{
              value: values.otherExpertise ?? "",
              onChange: (value) =>
                form.setValue("otherExpertise", value, { shouldDirty: true }),
            }}
          />
        );
      case "upload":
        return (
          <div className={styles.headshot}>
            <ChoiceField
              {...choiceProps}
              multiple
              required={false}
              options={["Permission to use LinkedIn headshot"]}
              value={
                headshot === "linkedin-permission"
                  ? ["Permission to use LinkedIn headshot"]
                  : []
              }
              onChange={(selected) => {
                if (selected.length)
                  form.setValue("headshot", "linkedin-permission", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                else form.resetField("headshot");
              }}
            />
            <div className={styles.orDivider}>
              <span>or</span>
            </div>
            <p className={styles.uploadLabel}>Upload your own</p>
            <FileUploadField
              {...choiceProps}
              id={`${common.id}-file`}
              required={false}
              accept={question.accept}
              value={headshot instanceof File ? headshot : undefined}
              onChange={(file) =>
                form.setValue(question.field, file, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Selected headshot"
                className={styles.headshotImage}
              />
            )}
          </div>
        );
      case "choice": {
        if (question.field === "pronouns")
          return (
            <ChoiceField
              {...choiceProps}
              columns={question.columns}
              options={PRONOUNS}
              value={values.pronouns}
              onChange={(value) =>
                form.setValue("pronouns", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              other={{
                value: values.otherPronoun ?? "",
                onChange: (value) =>
                  form.setValue("otherPronoun", value, { shouldDirty: true }),
              }}
            />
          );
        if (question.field === "dietaryRestrictions")
          return (
            <ChoiceField
              {...choiceProps}
              columns={question.columns}
              options={DIETARY_OPTIONS}
              value={values.dietaryRestrictions}
              onChange={(value) =>
                form.setValue("dietaryRestrictions", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              other={{
                value: values.otherDietaryRestrictions ?? "",
                onChange: (value) =>
                  form.setValue("otherDietaryRestrictions", value, {
                    shouldDirty: true,
                  }),
              }}
            />
          );
        const field = question.field;
        const yes = "Yes";
        return (
          <ChoiceField
            {...choiceProps}
            columns={question.columns}
            options={[yes, "No"]}
            value={
              values[field] === undefined
                ? undefined
                : values[field]
                  ? yes
                  : "No"
            }
            onChange={(value) =>
              form.setValue(field, value !== "No", {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        );
      }
    }
  }

  function answer(field: PartnerQuestionField) {
    if (field === "companyName" && values.participatingIndependently)
      return "Participating independently";
    if (field === "headshot")
      return headshot === "linkedin-permission"
        ? "Permission to use LinkedIn headshot"
        : headshot?.name || "Not provided";
    if (field === "areasOfExpertise")
      return formatPartnerExpertise(values) || "Not provided";
    if (field === "pronouns" && values.pronouns === "Other")
      return values.otherPronoun || "Other";
    if (
      field === "dietaryRestrictions" &&
      values.dietaryRestrictions === "Other"
    )
      return values.otherDietaryRestrictions || "Other";
    const value = values[field];
    return typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value || "Not provided");
  }

  return (
    <section ref={shell} className={styles.shell} data-mode={props.mode}>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600&family=Source+Serif+4:ital,wght@0,350;1,350&display=swap"
        />
      </Head>
      {props.mode === "preview" && (
        <p className={styles.previewNote}>
          Preview only. No files are uploaded and no registration is created.
        </p>
      )}
      {flow.kind === "complete" ? (
        <PartnerRegistrationComplete
          email={values.email}
          preview={props.mode === "preview"}
        />
      ) : flow.kind === "welcome" ? (
        <div className={styles.welcome}>
          <WelcomeVideo />
          <div className={styles.welcomeContent}>
            <h2 ref={heading} tabIndex={-1} className={styles.title}>
              {PARTNER_WELCOME.title}
            </h2>
            <p className={styles.welcomeBody}>
              {PARTNER_WELCOME.body}{" "}
              <a
                href={`mailto:${PARTNER_CONTACT_EMAIL}`}
                className={styles.contactLink}
              >
                {PARTNER_CONTACT_EMAIL}
              </a>
              .
            </p>
            <Button
              type="button"
              className={styles.startButton}
              onClick={() => void advance()}
            >
              Start <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : (
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void advance();
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              flow.kind === "review" &&
              event.target instanceof HTMLInputElement
            ) {
              event.preventDefault();
            }
          }}
          aria-label="BluePrint partner registration"
          aria-busy={busy}
          className={styles.form}
        >
          <nav aria-label="Registration sections">
            <ol className={styles.groups}>
              {progressSteps.map((group, index) => (
                <li
                  key={group.id}
                  data-complete={index <= currentStepIndex}
                  aria-current={
                    (flow.kind === "review" ? "review" : flow.group) ===
                    group.id
                      ? "step"
                      : undefined
                  }
                >
                  <span className={styles.segment} aria-hidden="true" />
                  <span className={styles.srOnly}>{group.label}</span>
                </li>
              ))}
            </ol>
          </nav>
          <nav className={styles.actions} aria-label="Registration navigation">
            <Button
              type="button"
              variant="ghost"
              aria-label={
                flow.kind === "section" && flow.mode === "editing"
                  ? "Back to review"
                  : "Back"
              }
              disabled={busy}
              onClick={() => {
                setDirection("backward");
                dispatch({ type: "back" });
              }}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              aria-label={
                flow.kind === "review"
                  ? props.mode === "preview"
                    ? "Finish preview"
                    : "Submit registration"
                  : flow.mode === "editing"
                    ? "Return to review"
                    : "Continue"
              }
              disabled={busy}
              onClick={() => void advance()}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </nav>
          <div
            key={flow.kind === "section" ? flow.group : flow.kind}
            className={styles.page}
            data-direction={direction}
            data-personal={flow.kind === "section" && flow.group === "personal"}
          >
            <div className={styles.pageIntro}>
              <h2 ref={heading} tabIndex={-1} className={styles.title}>
                {currentGroup?.label ?? "Check your details"}
              </h2>
              <p className={styles.sectionDescription}>
                {currentGroup?.description ??
                  "Review your answers before submitting your registration."}
              </p>
            </div>
            {flow.kind === "review" ? (
              <div className={styles.review}>
                {PARTNER_GROUPS.map((group) => (
                  <section key={group.id} aria-label={group.label}>
                    <h3 className={styles.reviewHeading}>{group.label}</h3>
                    <dl>
                      {partnerQuestionsForGroup(group.id).map(
                        ({ field, label }) => (
                          <div key={field} className={styles.reviewRow}>
                            <div>
                              <dt>{label}</dt>
                              <dd>{answer(field)}</dd>
                            </div>
                            <button
                              type="button"
                              disabled={busy}
                              className={styles.edit}
                              aria-label={`Edit ${label}`}
                              onClick={() => {
                                setDirection("backward");
                                dispatch({ type: "edit", field });
                              }}
                            >
                              <Pencil size={18} aria-hidden="true" />
                            </button>
                          </div>
                        ),
                      )}
                    </dl>
                  </section>
                ))}
              </div>
            ) : (
              <div className={styles.fields}>
                {currentQuestions.map((question) => (
                  <QuestionField
                    key={question.field}
                    id={`${formId}-${question.field}`}
                    field={question.field}
                    label={question.label}
                    required={
                      question.required &&
                      !(
                        question.field === "companyName" &&
                        values.participatingIndependently
                      )
                    }
                    description={question.description}
                    hint={
                      question.kind === "textarea" ? question.hint : undefined
                    }
                    error={form.formState.errors[question.field]?.message}
                  >
                    {(common) => control(question, common)}
                  </QuestionField>
                ))}
              </div>
            )}
            {form.formState.errors.root?.message && (
              <p role="alert" className={styles.error}>
                {form.formState.errors.root.message}
              </p>
            )}
            <div className={styles.confirmActions}>
              <Button type="submit" className={styles.okButton} disabled={busy}>
                {busy
                  ? "Submitting..."
                  : flow.kind === "review"
                    ? "Submit"
                    : "OK"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
