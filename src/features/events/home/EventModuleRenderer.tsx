import { EventConnectionsModule } from "./EventConnectionsModule";
import { RegistrationStatusModule } from "./RegistrationStatusModule";
import { QaModule } from "../qa/QaModule";
import { defaultEventModules } from "@/lib/eventPageConfig";
import type { EventPageModuleType } from "@/lib/eventPageConfig";
import { DBRegistrationStatus } from "@/types/types";
import type {
  EventCounts,
  EventHomeEvent,
  EventPageModule,
  EventRegistrationRecord,
} from "./types";

type EventModuleRendererProps = {
  event: EventHomeEvent;
  className?: string;
  counts?: EventCounts;
  modules?: EventPageModule[];
  registration?: EventRegistrationRecord;
  registrationHref: string;
  registrationLoading: boolean;
  signedIn: boolean;
};

const canShowAdminOnlyModulesOnPublicPage = false;

function hasAnyEventRegistration(registration?: EventRegistrationRecord) {
  return Boolean(registration);
}

function canShowModuleOnPublicEventPage({
  module,
  registration,
  signedIn,
}: {
  module: EventPageModule;
  registration?: EventRegistrationRecord;
  signedIn: boolean;
}) {
  switch (module.visibility) {
    case "public":
      return true;
    case "signedIn":
      return signedIn;
    case "registered":
      return hasAnyEventRegistration(registration);
    case "checkedIn":
      return (
        registration?.registrationStatus === DBRegistrationStatus.CHECKED_IN
      );
    case "admin":
      return canShowAdminOnlyModulesOnPublicPage;
    default:
      return false;
  }
}

const renderableModuleIds = new Set<EventPageModuleType>([
  "registration",
  "qa",
  "connections",
]);

function canRenderModule(module: EventPageModule) {
  return renderableModuleIds.has(module.id);
}

export function EventModuleRenderer({
  event,
  className = "mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2",
  counts,
  modules,
  registration,
  registrationHref,
  registrationLoading,
  signedIn,
}: EventModuleRendererProps) {
  const enabledModules = (modules ?? defaultEventModules)
    .filter((module) =>
      canShowModuleOnPublicEventPage({ module, registration, signedIn }),
    )
    .filter(canRenderModule)
    .sort((a, b) => a.order - b.order);

  if (enabledModules.length === 0) return null;

  return (
    <div className={className}>
      {enabledModules.map((module) => {
        switch (module.id) {
          case "registration":
            return (
              <RegistrationStatusModule
                key={module.id}
                event={event}
                counts={counts}
                registration={registration}
                registrationHref={registrationHref}
                registrationLoading={registrationLoading}
                signedIn={signedIn}
              />
            );
          case "qa":
            return (
              <QaModule
                key={module.id}
                eventId={event.id}
                year={String(event.year)}
              />
            );
          case "connections":
            return <EventConnectionsModule key={module.id} event={event} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
