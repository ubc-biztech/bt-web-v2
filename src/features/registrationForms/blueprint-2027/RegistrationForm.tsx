import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RegistrationFormProps } from "@/features/registrationForms/types";
import type { RegistrationPayload } from "@/lib/registrationStrategy/registrationStrategy";
import {
  blueprintAttendeeRegistrationSchema,
  type BlueprintAttendeeRegistrationValues,
} from "./Definition";

function buildRegistrationPayload(
  _values: BlueprintAttendeeRegistrationValues,
): RegistrationPayload | null {
  // Keep submission blocked until real fields and their payload mapping exist.
  return null;
}

export function BluePrintRegistrationForm({
  submitting,
  onSubmit,
}: RegistrationFormProps) {
  const form = useForm<BlueprintAttendeeRegistrationValues>({
    resolver: zodResolver(blueprintAttendeeRegistrationSchema),
    defaultValues: {},
  });
  const { isSubmitting, errors } = form.formState;
  const payload = buildRegistrationPayload(form.watch());

  async function handleValidSubmit(
    values: BlueprintAttendeeRegistrationValues,
  ) {
    const registrationPayload = buildRegistrationPayload(values);
    if (submitting || isSubmitting || registrationPayload === null) return;

    form.clearErrors("root");
    try {
      if (!(await onSubmit(registrationPayload))) {
        form.setError("root", {
          message: "Unable to submit registration. Please try again.",
        });
      }
    } catch {
      form.setError("root", {
        message: "Unable to submit registration. Please try again.",
      });
    }
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-lg bg-white p-6 text-gray-900">
      <h1 className="text-2xl font-semibold !text-gray-900">Registration</h1>
      <form
        className="mt-6 space-y-6"
        onSubmit={form.handleSubmit(handleValidSubmit)}
        aria-busy={submitting || isSubmitting}
      >
        <div className="min-h-24">
          {/* Add attendee fields here with validation in Definition.ts. */}
        </div>
        <p id="blueprint-registration-status" className="text-sm text-gray-600">
          Registration is not available yet.
        </p>
        {errors.root?.message && (
          <p role="alert" className="text-sm text-red-700">
            {errors.root.message}
          </p>
        )}
        <button
          type="submit"
          disabled={payload === null || submitting || isSubmitting}
          aria-describedby="blueprint-registration-status"
          className="rounded-md bg-gray-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting || isSubmitting ? "Submitting..." : "Submit registration"}
        </button>
      </form>
    </section>
  );
}
