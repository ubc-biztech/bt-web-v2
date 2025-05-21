import React, { useEffect, useRef } from "react";
import { useState } from "react";
import PopupModal from "./popup/editPopUp";
import { Card, CardFooter } from "@/components/ui/card";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button } from "@/components/ui/button";
import { extractTime, extractMonthDay } from "../../util/extractDate";

// this is placeholder if no event image is found
import placeHolderImage from "../../assets/event-placeholder.jpeg";
import Image from "next/image";
import { BiztechEvent } from "@/types/types";
import { ModalHandlers } from "@/pages/admin/home";
import { PopUpItem } from "./types";

type Props = {
  event: BiztechEvent;
  eventClick: (event: BiztechEvent, isOptionsClick?: boolean) => void;
  modalHandlers: ModalHandlers;
};

const editEventPopupItems: PopUpItem[] = [
  PopUpItem.EditEvent,
  PopUpItem.ViewAsMember,
  PopUpItem.DeleteEvent,
];

export default function EventCard({ event, eventClick, modalHandlers }: Props) {
  const [isModalOpen, setModal] = useState(false);
  const startTime = event ? extractTime(event.startDate) : "";
  const dateTime = event ? extractMonthDay(event.startDate) : "";
  const displayDate = event ? startTime + " " + dateTime : "Event not Found";

  const ref = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    if (event) {
      eventClick(event, false);
    }
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from firing
    if (event) {
      setModal(!isModalOpen);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        !isModalOpen &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, isModalOpen]);

  return (
    <Card
      className="w-9/10 border-none bg-events-card-bg cursor-pointer"
      onClick={handleCardClick}
    >
      <Image
        src={event?.imageUrl || placeHolderImage}
        alt="event-image"
        className="w-full h-[250px] rounded-t-lg object-cover"
        width={100}
        height={100}
      />
      <CardFooter className="font-poppins text-white block mt-4 mb-4 ml-1 mr-1 pb-0">
        <div className="flex items-center justify-between">
          <h5 className="text-white font-500">{event?.ename}</h5>
          <Button
            variant="ghost"
            className="text-white bg-transparent w-2 h-7"
            onClick={handleOptionsClick}
            onMouseLeave={() => setModal(false)}
          >
            {isModalOpen ? (
              <PopupModal
                editEventPopupItems={editEventPopupItems}
                ref={ref}
                modalHandlers={modalHandlers}
                eventID={event.id}
                eventYear={event.year}
              />
            ) : (
              <MoreVertIcon />
            )}
          </Button>
        </div>
        <p className="p3 text-baby-blue mt-2 mb-2">{displayDate}</p>
      </CardFooter>
    </Card>
  );
}
