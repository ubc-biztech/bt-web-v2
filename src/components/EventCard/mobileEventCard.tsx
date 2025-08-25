import React, { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
// more-vert icon
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Button } from "@/components/ui/button";
import { extractTime, extractMonthDay } from "../../util/extractDate";

// this is placeholder if no event image is found
import placeHolderImage from "../../assets/event-placeholder.jpeg";
import Image from "next/image";
import { BiztechEvent } from "@/types/types";
import { ModalHandlers } from "@/pages/admin/home";
import { PopUpItem } from "./types";
import PopupModal from "./popup/editPopUp";

type Props = {
  event: BiztechEvent | null;
  eventClick: (event: BiztechEvent) => void;
  modalHandlers: ModalHandlers;
  viewMode?: "grid" | "list";
};

const editEventPopupItems: PopUpItem[] = [
  PopUpItem.ViewRegistrations,
  PopUpItem.EditEvent,
  PopUpItem.ViewAsMember,
  PopUpItem.DeleteEvent,
];

export default function MobileEventCard({
  event,
  eventClick,
  modalHandlers,
  viewMode = "grid",
}: Props) {
  const [isModalOpen, setModal] = useState(false);
  const startTime = event ? extractTime(event.startDate) : "";
  const dateTime = event ? extractMonthDay(event.startDate) : "";
  const displayDate = event ? startTime + " " + dateTime : "Event not Found";

  const cardRef = useRef<HTMLDivElement>(null);

  const handleMobileMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from firing
    if (event) {
      setModal(!isModalOpen);
    }
  };

  const handleClick = () => {
    if (event) {
      if (isModalOpen) {
        setModal(false);
      } else {
        eventClick(event);
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isModalOpen &&
        cardRef.current &&
        !cardRef.current.contains(event.target as Node)
      ) {
        setModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cardRef, isModalOpen]);

  return (
    <Card
      className={`w-full border-none bg-bt-blue-300 p-2 mb-4 ${
        viewMode === "list" ? "h-[100px] flex" : "block"
      }`}
      onClick={handleClick}
      ref={cardRef}
    >
      {viewMode === "list" ? (
        // List view: horizontal layout with image on left
        <>
          <div className="flex-shrink-0 mr-4">
            <Image
              src={event?.imageUrl ?? placeHolderImage}
              alt="event-image"
              className="w-20 h-16 rounded-lg object-cover"
              width={80}
              height={64}
            />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div className="max-w-[70%] overflow-hidden">
              <p className="p1 text-white font-500 truncate">{event?.ename}</p>
              <p className="p3 text-bt-blue-100">{displayDate}</p>
            </div>
            <Button
              variant="ghost"
              className="text-white bg-transparent w-2 h-7 flex-shrink-0"
              onClick={handleMobileMoreClick}
            >
              <div className="relative">
                <MoreVertIcon />
                <div className="absolute z-50 top-full right-[200px]">
                  {isModalOpen && event && (
                    <PopupModal
                      editEventPopupItems={editEventPopupItems}
                      modalHandlers={modalHandlers}
                      eventID={event.id}
                      eventYear={event.year}
                    />
                  )}
                </div>
              </div>
            </Button>
          </div>
        </>
      ) : (
        // Grid view: vertical layout with image on top
        <>
          <Image
            src={event?.imageUrl ?? placeHolderImage}
            alt="event-image"
            className="w-full h-48 rounded-lg object-cover mb-4"
            width={100}
            height={100}
          />
          <div className="text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="p1 text-white font-500 truncate">{event?.ename}</p>
              <Button
                variant="ghost"
                className="text-white bg-transparent w-2 h-7"
                onClick={handleMobileMoreClick}
              >
                <div className="relative">
                  <MoreVertIcon />
                  <div className="absolute z-50 top-full right-[200px]">
                    {isModalOpen && event && (
                      <PopupModal
                        editEventPopupItems={editEventPopupItems}
                        modalHandlers={modalHandlers}
                        eventID={event.id}
                        eventYear={event.year}
                      />
                    )}
                  </div>
                </div>
              </Button>
            </div>
            <p className="p3 text-bt-blue-100">{displayDate}</p>
          </div>
        </>
      )}
    </Card>
  );
}
