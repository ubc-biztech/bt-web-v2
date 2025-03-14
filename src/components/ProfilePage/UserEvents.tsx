import Image from "next/image";
import Link from "next/link";
import * as Separator from "@radix-ui/react-separator";
import TextIcon from "./TextIcon";
import ProfileEventCard from "./ProfileEventCard";
import RegisteredIcon from "../../../public/assets/icons/registered_events_icon.svg";
import SavedIcon from "../../../public/assets/icons/bookmark_icon.svg";
import BizBot from "../../../public/assets/bizbot_peeking.png";
import { BiztechEvent } from "@/types";
import { isMobile } from "@/util/isMobile";
import { useState, useEffect } from "react";

interface UserEventsProps {
  registeredEvents: BiztechEvent[];
  savedEvents: BiztechEvent[];
}

export const UserEvents: React.FC<UserEventsProps> = ({
  registeredEvents,
  savedEvents,
}) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsMobileDevice(isMobile(userAgent));
  }, []);
  return (
    <div className="relative bg-profile-card-bg rounded-md p-6 w-full lg:w-[55%]">
      <Image
        src={BizBot}
        alt="BizBot"
        className="absolute top-[-150px] right-[-10px] h-[150px] w-[auto] hidden lg:block"
      />
      <h4 className="text-biztech-green">Your Events</h4>
      <Separator.Root className="SeparatorRoot my-3 mx-0 bg-profile-separator-bg h-[0.5px]" />
      <TextIcon
        className="mb-4"
        text={<h5 className="text-white">Registered</h5>}
        icon={RegisteredIcon}
        iconSize={24}
      />
      <div
        className="flex items-center justify-center gap-6 mb-6"
        style={{
          flexDirection: registeredEvents.length === 0 ? "column" : "row",
        }}
      >
        {registeredEvents.length === 0 ? (
          <h6 className="text-baby-blue text-center">No registered events</h6>
        ) : (
          registeredEvents
            .slice(isMobileDevice ? -2 : -3)
            .map((event) => <ProfileEventCard initialData={event} key={event.id} />)
        )}
      </div>

      <TextIcon
        className="my-4"
        text={<h5 className="text-white">Saved</h5>}
        icon={SavedIcon}
        iconSize={24}
      />
      <div
        className="flex flex-col items-center justify-center gap-6"
        style={{ flexDirection: savedEvents.length === 0 ? "column" : "row" }}
      >
        {savedEvents.length === 0 ? (
          <h6 className="text-baby-blue text-center">No saved events</h6>
        ) : (
          savedEvents
            .slice(isMobileDevice ? -2 : -3)
            .map((event) => <ProfileEventCard initialData={event} key={event.id} />)
        )}
      </div>
      <Separator.Root className="SeparatorRoot my-6 mx-0 bg-profile-separator-bg h-[0.5px]" />
      <Link href="">
        <p className="text-white text-right underline text-xs">View all</p>
      </Link>
    </div>
  );
};
