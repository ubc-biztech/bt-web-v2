import { RegistrationStatusModule } from "./RegistrationStatusModule";
import type {
  EventCounts,
  EventHomeEvent,
  EventPageModule,
  EventRegistrationRecord,
} from "./types";

export const defaultEventModules: EventPageModule[] = [
  { type: "registration", enabled: true, order: 1 },
  { type: "qa", enabled: false, order: 2 },
  { type: "connections", enabled: false, order: 3 },
];

type EventModuleRendererProps = {
  event: EventHomeEvent;
  counts?: EventCounts;
  modules?: EventPageModule[];
  registration?: EventRegistrationRecord;
  registrationHref: string;
  registrationLoading: boolean;
  signedIn: boolean;
};

export function EventModuleRenderer({
  event,
  counts,
  modules,
  registration,
  registrationHref,
  registrationLoading,
  signedIn,
}: EventModuleRendererProps) {
  const enabledModules = (modules ?? defaultEventModules)
    .filter((module) => module.enabled)
    .sort((a, b) => a.order - b.order);

  if (enabledModules.length === 0) return null;

  return (
    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
      {enabledModules.map((module) => {
        switch (module.type) {
          case "registration":
            return (
              <RegistrationStatusModule
                key={module.type}
                event={event}
                counts={counts}
                registration={registration}
                registrationHref={registrationHref}
                registrationLoading={registrationLoading}
                signedIn={signedIn}
              />
            );
          case "qa": // SOON TO BE ADDED TODO
          case "connections":
            return null;
          default:
            return null;
        }
      })}
    </div>
  );
}
