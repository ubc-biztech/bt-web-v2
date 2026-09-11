import { useRef, useReducer, useState } from "react";
import styles from "./RegistrationForm.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Path } from "react-hook-form";
import type { RegistrationFormProps } from "@/features/registrationForms/types";
import type { RegistrationPayload } from "@/lib/registrationStrategy/registrationStrategy";
import {
  HH_AVATARS,
  HH_DEFAULT_AVATAR,
  HH_ROLES,
  HH_TRACKS,
  HelloHacksRegistrationSchema,
  type HHAvatarId,
  type HHRoleId,
  type HHTrackId,
  type HelloHacksRegistrationValues,
} from "./Definition";
import {
  INITIAL_HH_FLOW_STATE,
  hhFlowReducer,
  type HHEditableStep,
} from "./flow";
import { useTrackPreview } from "./hooks/useTrackPreview";
import { ApplicationPage } from "./pages/ApplicationPage";
import { AvatarBubble } from "./components/AvatarBubble";
import { AvatarPage } from "./pages/AvatarPage";
import {
  ConfirmDetailsPage,
  type ConfirmDetailField,
} from "./pages/ConfirmDetailsPage";
import { ConfirmDetailsInput } from "./components/ConfirmDetailsInput";
import { ReviewPage, type ReviewRow } from "./pages/ReviewPage";
import { RolePage } from "./pages/RolePage";
import { SongPage } from "./pages/SongPage";
import { SuccessPage } from "./pages/SuccessPage";
import { WelcomePage } from "./pages/WelcomePage";

type FieldName = Path<HelloHacksRegistrationValues>;

const APPLICATION_REQUIRED_FIELDS = [
  "codingConfidence",
  "hackathonsAttended",
  "workshop",
  "tenKPlan",
  "beigeFlag",
] as const satisfies readonly FieldName[];

const APPLICATION_FIELDS = [
  ["codingConfidence", "How confident are you in your coding abilities?"],
  ["hackathonsAttended", "How many hackathons have you attended?"],
  [
    "workshop",
    "Will you be attending the pre-hackathon workshop? (September 24 from 6:30pm - 9:00pm)",
  ],
  ["tenKPlan", "If you had 10k right now, what would you do with it and why?"],
  ["beigeFlag", "What's your beige flag?"],
  ["teammate1", "Teammate 1"],
  ["teammate2", "Teammate 2"],
  ["teammate3", "Teammate 3"],
] as const satisfies readonly (readonly [FieldName, string])[];

/**
 * The design shows a single "Full name" input, but the registration payload
 * needs first and last name separately — see the confirm-details ticket.
 */
const CONFIRM_FIELDS = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email address"],
  ["year", "Year level"],
  ["faculty", "Faculty"],
  ["major", "Specialization"],
] as const satisfies readonly (readonly [FieldName, string])[];

export function HelloHacksRegistrationForm({
  user,
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const [flow, dispatch] = useReducer(hhFlowReducer, INITIAL_HH_FLOW_STATE);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(
    `${user.fname ?? ""} ${user.lname ?? ""}`.trim(),
  );
  const form = useForm<HelloHacksRegistrationValues>({
    resolver: zodResolver(HelloHacksRegistrationSchema),
    defaultValues: {
      email: user.email ?? user.id,
      firstName: user.fname ?? "",
      lastName: user.lname ?? "",
      studentId: user.studentId?.toString() ?? "",
      year: "",
      dietaryRestrictions: user.diet ?? "",
      faculty: user.faculty ?? "",
      major: user.major ?? "",
      teammate1: "",
      teammate2: "",
      teammate3: "",
      hackathonsAttended: "",
      tenKPlan: "",
      beigeFlag: "",
      soundtrack: HH_TRACKS[0].id,
    },
  });
  const { setValue, watch, trigger, register, formState } = form;
  const values = watch();
  const preview = useTrackPreview(values.soundtrack, flow.step === "song");

  function select(field: FieldName, value: string) {
    setValue(field, value, { shouldDirty: true, shouldValidate: true });
  }

  /** Validates only the fields owned by the current step before advancing. */
  async function continueWith(fields: readonly FieldName[]) {
    if (await trigger(fields as FieldName[])) {
      dispatch({ type: "CONTINUE" });
    }
  }

  function goBack() {
    dispatch({ type: "BACK" });
  }

  function editFromReview(step: HHEditableStep) {
    dispatch({ type: "EDIT", step });
  }

  function handleFullNameChange(value: string) {
    setFullName(value);

    const trimmedValue = value.trim();
    const [firstName = "", ...lastNameParts] = trimmedValue.split(/\s+/);
    setValue("firstName", firstName, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("lastName", lastNameParts.join(" "), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function focusFirstConfirmField() {
    fullNameInputRef.current?.focus();
    fullNameInputRef.current?.select();
  }

  const isFilled = (field: FieldName) =>
    Boolean(values[field]?.toString().trim());

  const confirmDetailFields: ConfirmDetailField[] = [
    {
      id: "full-name",
      label: "Full name",
      error:
        formState.errors.firstName || formState.errors.lastName
          ? "Please enter your first and last name"
          : undefined,
      control: (
        <ConfirmDetailsInput
          ref={fullNameInputRef}
          value={fullName}
          onChange={(event) => handleFullNameChange(event.target.value)}
          autoComplete="name"
        />
      ),
    },
    {
      id: "email",
      label: "Email address",
      error: formState.errors.email?.message,
      control: (
        <ConfirmDetailsInput
          {...register("email")}
          className="cursor-default"
          readOnly
          aria-readonly="true"
          autoComplete="email"
        />
      ),
    },
    {
      id: "year",
      label: "Year level",
      error: formState.errors.year?.message,
      control: <ConfirmDetailsInput {...register("year")} />,
    },
    {
      id: "faculty",
      label: "Faculty",
      error: formState.errors.faculty?.message,
      control: <ConfirmDetailsInput {...register("faculty")} />,
    },
    {
      id: "major",
      label: "Specialization",
      error: formState.errors.major?.message,
      control: <ConfirmDetailsInput {...register("major")} />,
    },
    {
      id: "dietary-restrictions",
      label: "Dietary restrictions (optional)",
      error: formState.errors.dietaryRestrictions?.message,
      control: (
        <ConfirmDetailsInput
          {...register("dietaryRestrictions")}
          placeholder="e.g. Vegetarian, nut allergy, or none"
        />
      ),
    },
  ];

  const chosenAvatar = HH_AVATARS.find(({ id }) => id === values.avatar);

  const reviewRows: ReviewRow[] = [
    {
      key: "avatar",
      label: "Avatar",
      value: chosenAvatar?.label ?? "Not selected",
      step: "avatar",
      media: chosenAvatar ? (
        <AvatarBubble avatar={chosenAvatar} size="72px" />
      ) : undefined,
    },
    {
      key: "soundtrack",
      label: "Soundtrack",
      value:
        HH_TRACKS.find(({ id }) => id === values.soundtrack)?.title ??
        "Not selected",
      step: "song",
    },
    {
      key: "role",
      label: "Role",
      value:
        HH_ROLES.find(({ id }) => id === values.role)?.label ?? "Not selected",
      step: "role",
    },
    ...APPLICATION_FIELDS.map(([field, label]) => ({
      key: field,
      label,
      value: values[field]?.toString() ?? "",
      step: "application" as const,
    })),
    {
      key: "dietaryRestrictions",
      label: "Dietary restrictions",
      value: values.dietaryRestrictions?.trim() || "None",
      step: "confirm-details",
    },
    {
      key: "profile",
      label: "Profile",
      value: "Confirmed",
      step: "confirm-details",
    },
  ];

  async function handleValidSubmit(submitted: HelloHacksRegistrationValues) {
    if (flow.step !== "review") return;

    const payload: RegistrationPayload = {
      email: submitted.email,
      fname: submitted.firstName,
      studentId: submitted.studentId || undefined,
      basicInformation: {
        fname: submitted.firstName,
        lname: submitted.lastName,
        year: submitted.year,
        faculty: submitted.faculty,
        major: submitted.major,
        diet: submitted.dietaryRestrictions || "None",
      },
      dynamicResponses: {
        hh_avatar: submitted.avatar,
        hh_soundtrack: submitted.soundtrack,
        hh_role: submitted.role,
        hh_coding_confidence: submitted.codingConfidence,
        hh_hackathons_attended: submitted.hackathonsAttended,
        hh_workshop: submitted.workshop,
        hh_ten_k: submitted.tenKPlan,
        hh_beige_flag: submitted.beigeFlag,
        hh_teammate_1: submitted.teammate1 ?? "",
        hh_teammate_2: submitted.teammate2 ?? "",
        hh_teammate_3: submitted.teammate3 ?? "",
      },
    };

    if (await onSubmit(payload)) {
      dispatch({ type: "SUBMISSION_SUCCEEDED" });
    }
  }

  function renderPage() {
    switch (flow.step) {
      case "welcome":
        return <WelcomePage onContinue={() => dispatch({ type: "START" })} />;

      case "avatar":
        return (
          <AvatarPage
            avatars={HH_AVATARS}
            selectedAvatar={values.avatar as HHAvatarId | undefined}
            onBack={goBack}
            onSelectAvatar={(avatar) => select("avatar", avatar)}
            onContinue={() => continueWith(["avatar"])}
          />
        );

      case "song":
        return (
          <SongPage
            tracks={HH_TRACKS}
            selectedTrack={values.soundtrack as HHTrackId | undefined}
            preview={preview}
            onBack={goBack}
            onSelectTrack={(track) => select("soundtrack", track)}
            onContinue={() => continueWith(["soundtrack"])}
          />
        );

      case "role":
        return (
          <RolePage
            roles={HH_ROLES}
            selectedRole={values.role as HHRoleId | undefined}
            onBack={goBack}
            onSelectRole={(role) => select("role", role)}
            onContinue={() => continueWith(["role"])}
          />
        );

      case "application":
        return (
          <ApplicationPage
            canContinue={APPLICATION_REQUIRED_FIELDS.every((field) =>
              isFilled(field),
            )}
            onBack={goBack}
            onContinue={() => continueWith([...APPLICATION_REQUIRED_FIELDS])}
            codingConfidence={values.codingConfidence}
            onSelectCodingConfidence={(rating) =>
              select("codingConfidence", rating)
            }
            codingConfidenceError={formState.errors.codingConfidence?.message}
            hackathonsAttended={values.hackathonsAttended ?? ""}
            hackathonsField={register("hackathonsAttended")}
            hackathonsError={formState.errors.hackathonsAttended?.message}
            workshop={values.workshop}
            onSelectWorkshop={(choice) => select("workshop", choice)}
            workshopError={formState.errors.workshop?.message}
            tenKPlan={values.tenKPlan ?? ""}
            tenKField={register("tenKPlan")}
            tenKError={formState.errors.tenKPlan?.message}
            beigeFlag={values.beigeFlag ?? ""}
            beigeFlagField={register("beigeFlag")}
            beigeFlagError={formState.errors.beigeFlag?.message}
            teammate1Field={register("teammate1")}
            teammate2Field={register("teammate2")}
            teammate3Field={register("teammate3")}
          />
        );

      case "confirm-details":
        return (
          <ConfirmDetailsPage
            fields={confirmDetailFields}
            avatar={chosenAvatar ?? HH_DEFAULT_AVATAR}
            profileName={fullName || "Your profile"}
            profilePronouns={user.gender}
            canContinue={CONFIRM_FIELDS.every(([field]) => isFilled(field))}
            onBack={goBack}
            onContinue={() =>
              continueWith(CONFIRM_FIELDS.map(([field]) => field))
            }
            onEditFirstField={focusFirstConfirmField}
          />
        );

      case "review":
        return (
          <ReviewPage
            rows={reviewRows}
            submitting={submitting}
            onBack={goBack}
            onEdit={editFromReview}
          />
        );

      case "success":
        return <SuccessPage />;
    }
  }

  return (
    // TODO(design): paper-texture background once the asset lands.
    // globals.css forces h1/h2/h3 to white; the light shell has to opt out of
    // that or every unstyled stub renders white-on-white.
    <div
      className={`${styles.shell} fixed inset-y-0 left-0 right-0 z-20 isolate overflow-y-auto bg-white text-black [&_h1]:text-inherit [&_h2]:text-inherit [&_h3]:text-inherit md:left-[250px]`}
    >
      <form
        className="relative z-10 h-full w-full"
        onSubmit={form.handleSubmit(handleValidSubmit)}
      >
        {renderPage()}
      </form>
    </div>
  );
}
