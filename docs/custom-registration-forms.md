# Custom registration forms

## Purpose

Events may use a custom, developer-built registration experience while keeping the existing registration lifecycle unchanged.

A custom form owns:

- Its React layout and interaction design.
- Its client-side validation.
- Its custom question definitions.
- Mapping its form values to the shared `RegistrationPayload`.

The shared registration page owns:

- Loading the event and current user.
- Checking for an existing registration.
- Deadline, capacity, and membership behavior.
- Selecting free, paid, application, or non-application registration.
- Registration and application statuses.
- Payment and confirmation behavior.
- Success and payment redirects.

Custom form components must not set statuses or call `/registrations` or `/payments` directly.

## Data flow

### Event creation

When an admin selects a registration experience, the existing event POST includes two additional pieces of information:

```json
{
  "registrationFormKey": "mis",
  "registrationQuestions": [
    {
      "questionId": "mis_career_interest",
      "label": "Which MIS career interests you most?",
      "type": "SELECT",
      "required": true,
      "choices": "Consulting,Data Analytics,Cybersecurity"
    }
  ]
}
```

`registrationFormKey` selects a hardcoded frontend component. `registrationQuestions` describes the custom answers to the backend, admin table, exports, and analytics.

The backend must save `registrationFormKey` on the event and return it from event GET requests. Existing events will not have the field and therefore use `default`.

### Attendee registration

The selected React form collects values and converts them into the existing canonical payload:

```ts
{
  email: "person@example.com",
  fname: "Jane",
  studentId: 12345678,
  basicInformation: {
    fname: "Jane",
    lname: "Doe",
    year: "3",
    faculty: "Commerce",
    major: "Business Technology Management"
  },
  dynamicResponses: {
    mis_career_interest: "Data Analytics"
  }
}
```

The shared controller passes this payload to the existing `RegistrationStateOld` strategy. The strategy adds `eventID`, `year`, `registrationStatus`, `applicationStatus`, `isPartner`, and `points` and sends the existing registration POST.

The definition and answer are connected by a stable question ID:

```text
registrationQuestions[].questionId = "mis_career_interest"
dynamicResponses["mis_career_interest"] = "Data Analytics"
```

Never use a label as an answer key. Labels may change; published question IDs must remain stable.

## Proposed structure

```text
src/features/registrationForms/
├── types.ts
├── registry.ts
├── default/
│   ├── definition.ts
│   └── DefaultRegistrationForm.tsx
└── mis/
    ├── definition.ts
    ├── schema.ts
    └── MISRegistrationForm.tsx
```

The existing `AttendeeEventRegistrationForm` can initially remain in its current location and be re-exported by the default definition. Moving it is optional and should not block the refactor.

## Shared contracts

Add a strict question type rather than leaving `RegistrationQuestion.type` as an arbitrary string:

```ts
export type RegistrationQuestionType =
  | "TEXT"
  | "SELECT"
  | "CHECKBOX"
  | "UPLOAD"
  | "WORKSHOP_SELECTION"
  | "SKILLS";

export type RegistrationQuestion = {
  questionId: string;
  label: string;
  type: RegistrationQuestionType;
  required: boolean;
  choices?: string;
  charLimit?: number;
  questionImageUrl?: string;
  participantCap?: string;
  isSkillsQuestion?: boolean;
};
```

All form components receive the same lifecycle-free props:

```ts
export type RegistrationFormProps = {
  event: BiztechEvent;
  user: User;
  submitting: boolean;
  onSubmit: (payload: RegistrationPayload) => Promise<boolean>;
};
```

Each registry entry supplies a component and the questions to send when creating an event:

```ts
export type RegistrationFormDefinition = {
  label: string;
  Component: React.ComponentType<RegistrationFormProps>;
  questions?: readonly RegistrationQuestion[];
};

export const REGISTRATION_FORMS = {
  default: {
    label: "Default registration form",
    Component: AttendeeEventRegistrationForm,
  },
  mis: {
    label: "MIS registration form",
    Component: MISRegistrationForm,
    questions: MIS_REGISTRATION_QUESTIONS,
  },
} as const satisfies Record<string, RegistrationFormDefinition>;

export type RegistrationFormKey = keyof typeof REGISTRATION_FORMS;
```

The default form has no hardcoded `questions` in the registry because admins continue configuring its questions. A custom form such as MIS supplies a fixed question list.

## Implementation plan

### Phase 1: Define and persist the form key

1. Add `registrationFormKey?: string` to the shared event type. Prefer consolidating the duplicate event types under `src/types.ts` and `src/types/types.ts` if feasible.
2. Add `registrationFormKey` to `EventFormSchema`, defaulting to `"default"`.
3. Add an admin selector populated from `REGISTRATION_FORMS`. Admins should see friendly labels, not raw keys.
4. Include the selected key in both the event creation POST and event edit PATCH.
5. When editing an event, initialize the selector from `data.registrationFormKey ?? "default"`.
6. Update the backend event model, create/update handlers, and GET serialization to store and return the field.

Acceptance criteria:

- Creating an event with MIS saves `registrationFormKey: "mis"`.
- Editing and reloading the event preserves the selection.
- Existing events resolve to `default` without a data migration.
- The backend rejects unknown keys if it maintains an allow-list; the frontend always handles an unknown returned key safely.

### Phase 2: Create the frontend registry

1. Add the shared types and `REGISTRATION_FORMS` registry.
2. Register the existing attendee form as `default` without changing its visible behavior.
3. Add a safe resolver:

```ts
export function getRegistrationForm(key?: string) {
  const resolvedKey = key ?? "default";
  return REGISTRATION_FORMS[resolvedKey as keyof typeof REGISTRATION_FORMS];
}
```

4. Treat a missing key as legacy/default. Treat an explicit but unknown key as a configuration error; do not silently show the wrong custom form.

Acceptance criteria:

- Missing key renders the current form.
- `default` renders the current form.
- `mis` resolves to the MIS component.
- An unknown explicit key renders an actionable configuration error.

### Phase 3: Make submission form-independent

The current attendee form decides whether to call `onSubmit` or `onSubmitPayment`. Move that decision to the registration route so custom forms receive only one `onSubmit` callback.

1. Make each form convert its values to `RegistrationPayload` before calling `onSubmit`.
2. Extract a shared route-level `submitRegistration(payload)` function.
3. Preserve the current strategy selection:

```ts
async function submitRegistration(
  payload: RegistrationPayload,
): Promise<boolean> {
  if (!userLoggedIn && (await checkRegistered(payload.email))) {
    return false;
  }

  const state = await getRegistrationState();
  if (!state) throw new Error("Unable to initialize registration state");

  const paid =
    !user.admin &&
    (event.pricing?.nonMembers > 0 || event.pricing?.members > 0);

  if (paid) {
    const result = event.isApplicationBased
      ? await state.regForPaidApp(payload)
      : await state.regForPaid(payload);

    if (event.isApplicationBased) {
      await router.push(
        `/event/${event.id}/${event.year}/register/success?isApplicationBased=true`,
      );
    } else if (result.paymentUrl) {
      window.location.assign(result.paymentUrl);
    } else {
      throw new Error("No payment URL returned");
    }

    return true;
  }

  if (event.isApplicationBased) {
    await state.regForFreeApp(payload);
  } else {
    await state.regForFree(payload);
  }

  await router.push(`/event/${event.id}/${event.year}/register/success`);
  return true;
}
```

4. Keep existing-registration, deadline, capacity, membership, accepted, confirmation, and payment-retry views in the shared route.
5. Do not change `RegistrationStateOld` behavior as part of this refactor.

Acceptance criteria:

- Forms never assign `registrationStatus` or `applicationStatus`.
- Forms never call registration or payment endpoints.
- Default-form behavior is unchanged for all four initial submission paths: free, paid, free application, and paid application.

### Phase 4: Connect question definitions to event writes

Create one helper used by both event creation and event editing:

```ts
export function getRegistrationQuestions(
  key: RegistrationFormKey,
  adminQuestions: RegistrationQuestion[],
) {
  return REGISTRATION_FORMS[key].questions ?? adminQuestions;
}
```

The admin event handler then sends:

```ts
const registrationFormKey = data.registrationFormKey;
const adminQuestions = data.customQuestions.map(transformCustomQuestion);

const body = {
  // Existing event fields...
  registrationFormKey,
  registrationQuestions: getRegistrationQuestions(
    registrationFormKey,
    adminQuestions,
  ),
};
```

Use the same transformation and helper for POST and PATCH. The current create and edit implementations differ: the edit transformation includes `questionId`, while the create transformation currently does not. Fix this during extraction so every question written to the backend has a stable `questionId`.

For a custom form, either hide the generic custom-question builder or show the fixed questions read-only. The fixed registry questions are the source of truth.

Acceptance criteria:

- Default events send the questions created by the admin.
- MIS events send `MIS_REGISTRATION_QUESTIONS`.
- POST and PATCH produce the same question shape.
- Every question contains a non-empty, stable `questionId`.

### Phase 5: Render the selected component

Replace the hardcoded `AttendeeEventRegistrationForm` render in the existing route:

```tsx
const definition = getRegistrationForm(event.registrationFormKey);

if (!definition) {
  return <RegistrationConfigurationError />;
}

const RegistrationForm = definition.Component;

return (
  <RegistrationForm
    event={event}
    user={user}
    submitting={submitting}
    onSubmit={submitRegistration}
  />
);
```

Only replace the form-rendering branch. Do not create separate Next.js routes for each experience, because that would duplicate the lifecycle controller.

### Phase 6: Add MIS and verify compatibility

1. Define `MIS_REGISTRATION_QUESTIONS`.
2. Define a Zod schema for the MIS form values.
3. Build the custom MIS component.
4. Map MIS values to `RegistrationPayload` using matching question IDs in `dynamicResponses`.
5. Register the form under the stable key `mis`.
6. Create a test event through the admin UI and verify event GET, registration POST, admin table columns, CSV export, and analytics.

Minimum verification matrix:

| Scenario                       | Default  | MIS      |
| ------------------------------ | -------- | -------- |
| Free event                     | Required | Required |
| Paid event                     | Required | Required |
| Free application event         | Required | Required |
| Paid application event         | Required | Required |
| Already registered             | Required | Required |
| Registration deadline passed   | Required | Required |
| Event full/waitlist behavior   | Required | Required |
| Accepted attendee confirmation | Required | Required |
| Payment retry                  | Required | Required |
| Signed-out duplicate email     | Required | Required |

Run `npm run lint` and `npm run build`. This repository currently has no automated test script, so add focused unit/component tests if test infrastructure is introduced during the refactor; otherwise record the manual matrix in the pull request.

## Developer guide: adding a custom form

The example below adds a form with the key `mis`. Replace that key and question IDs for a different experience.

### 1. Choose a permanent form key

Use a short lowercase key:

```ts
"mis";
```

Once events use a key, do not rename it without migrating those event records.

### 2. Define the custom questions

Create `src/features/registrationForms/mis/definition.ts`:

```ts
import type { RegistrationQuestion } from "@/types";

export const MIS_REGISTRATION_QUESTIONS = [
  {
    questionId: "mis_career_interest",
    label: "Which MIS career interests you most?",
    type: "SELECT",
    required: true,
    choices: "Consulting,Data Analytics,Cybersecurity",
  },
  {
    questionId: "mis_interest_reason",
    label: "Why are you interested in MIS?",
    type: "TEXT",
    required: true,
    charLimit: 500,
  },
] as const satisfies readonly RegistrationQuestion[];
```

Question types currently supported by the codebase:

| Type                 | Intended value                                                                     |
| -------------------- | ---------------------------------------------------------------------------------- |
| `TEXT`               | A free-form string                                                                 |
| `SELECT`             | One selected option as a string                                                    |
| `CHECKBOX`           | Multiple selected options, normalized consistently with the existing helper        |
| `UPLOAD`             | The uploaded file URL                                                              |
| `WORKSHOP_SELECTION` | One workshop selection, subject to capacity behavior                               |
| `SKILLS`             | Skills responses; currently rendered by the partner form but not the attendee form |

For a fully custom UI, the visual control does not have to match the type name exactly. The metadata type must still accurately describe the stored response for admin display and analysis.

Rules for question IDs:

- Prefix them with the form or event family, such as `mis_`.
- Use lowercase snake case.
- Never derive them from array indexes.
- Never reuse one ID for two meanings.
- Never change a published ID; add a new question ID instead.

### 3. Define client-side validation

Create `schema.ts`:

```ts
import { z } from "zod";

export const misRegistrationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  studentId: z.string().optional(),
  year: z.string().min(1, "Year is required"),
  faculty: z.string().min(1, "Faculty is required"),
  major: z.string().min(1, "Major is required"),
  careerInterest: z.string().min(1, "Select an interest"),
  interestReason: z.string().min(1).max(500),
});

export type MISRegistrationValues = z.infer<typeof misRegistrationSchema>;
```

The Zod schema validates the custom UI. It does not replace backend validation.

### 4. Build the component and map its payload

Create `MISRegistrationForm.tsx`:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RegistrationFormProps } from "../types";
import { misRegistrationSchema, type MISRegistrationValues } from "./schema";

export function MISRegistrationForm({
  user,
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const form = useForm<MISRegistrationValues>({
    resolver: zodResolver(misRegistrationSchema),
    defaultValues: {
      email: user.email ?? user.id,
      firstName: user.fname ?? "",
      lastName: user.lname ?? "",
      studentId: user.studentId?.toString() ?? "",
      year: user.year?.toString() ?? "",
      faculty: user.faculty ?? "",
      major: user.major ?? "",
      careerInterest: "",
      interestReason: "",
    },
  });

  async function handleValidSubmit(values: MISRegistrationValues) {
    return onSubmit({
      email: values.email,
      fname: values.firstName,
      studentId: values.studentId,
      basicInformation: {
        fname: values.firstName,
        lname: values.lastName,
        year: values.year,
        faculty: values.faculty,
        major: values.major,
      },
      dynamicResponses: {
        mis_career_interest: values.careerInterest,
        mis_interest_reason: values.interestReason,
      },
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit)}>
      {/* Custom MIS fields and layout */}
      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Register"}
      </button>
    </form>
  );
}
```

Every question ID declared in `MIS_REGISTRATION_QUESTIONS` must appear as a key in `dynamicResponses`, unless the question is optional and intentionally unanswered. Do not put ordinary identity fields in `dynamicResponses`.

### 5. Register the form

Add the form to `registry.ts`:

```ts
import { MISRegistrationForm } from "./mis/MISRegistrationForm";
import { MIS_REGISTRATION_QUESTIONS } from "./mis/definition";

export const REGISTRATION_FORMS = {
  default: defaultRegistrationForm,
  mis: {
    label: "MIS registration form",
    Component: MISRegistrationForm,
    questions: MIS_REGISTRATION_QUESTIONS,
  },
} as const satisfies Record<string, RegistrationFormDefinition>;
```

The admin selector should now include MIS automatically if it is generated from this registry.

### 6. Verify the form

Before using the experience for a live event, confirm:

- The admin can select it during event creation and editing.
- The event POST/PATCH contains the correct `registrationFormKey` and question definitions.
- The event GET returns the selected key.
- The registration URL renders the custom component.
- The registration POST contains answers under matching `dynamicResponses` keys.
- Free, paid, and application paths produce the same statuses as the default form.
- Existing registrations see status/confirmation views rather than a blank new form.
- Admin tables, exports, and analytics show the custom question labels and answers.
- Unknown keys and submission errors produce a visible error state.

## Pull request boundaries

The initial plumbing pull request should contain the registry, shared submission controller, event key persistence, and default-form compatibility. The first custom form can be included or follow in a second pull request.

Avoid combining this work with changes to registration status meanings, payment rules, or application transitions. Those belong to the lifecycle layer and are intentionally out of scope.
