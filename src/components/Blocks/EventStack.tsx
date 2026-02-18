import { BiztechEvent } from "@/types";
import BizImage from "../Common/BizImage";
import { useRouter } from "next/navigation";
import { GenericCard } from "../Common/Cards";

interface EventStackProps {
  events: BiztechEvent[];
  aspectRatio?: number;
  maxCards?: number;
}

export default function EventStack({
  events,
  aspectRatio = 4 / 3,
  maxCards = 3,
}: EventStackProps) {
  const router = useRouter();
  const cardsToShow = Math.min(events.length, maxCards);

  const horizontalSpacing = 80;
  const verticalSpacing = 70;

  const spacingFactor = horizontalSpacing / 100;
  const cardWidthPercent = 140 / (1 + (cardsToShow - 1) * spacingFactor);
  const actualHorizontalSpacing = (horizontalSpacing * cardWidthPercent) / 100;
  const actualVerticalSpacing = (verticalSpacing * cardWidthPercent) / 100;

  const cardHeightPercent = cardWidthPercent / aspectRatio;
  const totalVerticalOffset = (cardsToShow - 1) * actualVerticalSpacing;

  if (events.length === 0) {
    return (
      <GenericCard title="Past Events Attended">
        <div className="text-center h-full place-content-center py-8 text-bt-blue-0">
          No events attended yet.
        </div>
      </GenericCard>
    );
  }

  return (
    <GenericCard
      title="Past Events Attended"
      className="w-full lg:h-full h-[28rem]"
    >
      <div
        className="relative w-full mx-auto lg:h-fit"
        style={{
          height: `${cardHeightPercent + totalVerticalOffset}%`,
        }}
      >
        {events.slice(0, maxCards).map((event, idx) => {
          const zIndex = cardsToShow - idx;
          const rotations = [-4, 3, -2, 2, -1];
          const rotation = rotations[idx] || (idx % 2 === 0 ? -1 : 1);

          const translateX = idx * actualHorizontalSpacing;
          const translateY = idx * actualVerticalSpacing;
          const scale = 1 - idx * 0.02;

          return (
            <button
              type="button"
              key={event.id || idx}
              className="absolute top-0 left-0 transition-all duration-300 hover:scale-110 hover:z-[60] hover:rotate-0 cursor-pointer group"
              style={{
                zIndex,
                width: `${cardWidthPercent}%`,
                height: `${cardHeightPercent}%`,
                transform: `
                translateX(${translateX}%) 
                translateY(${translateY}%) 
                rotate(${rotation}deg) 
                scale(${scale})
              `,
                transformOrigin: "center center",
              }}
              onClick={() =>
                router.push(`/event/${event.id}/${event.year}/register`)
              }
            >
              <div
                className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-2xl border border-bt-blue-0/40 transition-all duration-300"
                style={{
                  aspectRatio: aspectRatio.toString(),
                }}
              >
                <BizImage
                  src={event.imageUrl}
                  alt={event.id}
                  width={720}
                  height={Math.round(720 / aspectRatio)}
                  style={{ objectFit: "cover" }}
                  className="w-full h-full"
                />

                {/* Enhanced gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-bt-blue-600/20 to-transparent pointer-events-none" />

                {/* Event info overlay */}
                <div className="absolute inset-0 bg-bt-blue-500/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3 md:p-4">
                  <div className="text-white">
                    <h3 className="font-semibold text-sm md:text-md drop-shadow-lg line-clamp-2">
                      {event.ename}
                    </h3>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </GenericCard>
  );
}
