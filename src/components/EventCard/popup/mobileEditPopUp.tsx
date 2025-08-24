import React from "react";
import PopupButton from "./popupButton";
import { motion } from "framer-motion";
import DeletePopup from "./deletePopUp";
import { BiztechEvent } from "@/types/types";
import { ModalHandlers } from "@/pages/admin/home";

type Props = {
  isClicked: boolean;
  isMobile: boolean;
  isDelete: boolean;
  event: BiztechEvent;
  setIsDelete: React.Dispatch<React.SetStateAction<boolean>>;
  modalHandlers: ModalHandlers;
};

const enum PopUpItem {
  EditEvent = "Edit Event",
  ViewAsMember = "View as Member",
  DeleteEvent = "Delete Event",
}

const editEventPopupItems: String[] = [
  PopUpItem.EditEvent,
  PopUpItem.ViewAsMember,
  PopUpItem.DeleteEvent,
];

export default function MobilePopup({
  isClicked,
  isMobile,
  isDelete,
  setIsDelete,
  event,
  modalHandlers,
}: Props) {
  const handleButtonClick = (item: String) => {
    switch (item) {
      case PopUpItem.DeleteEvent:
        modalHandlers.handleEventDelete();
        break;
      case PopUpItem.EditEvent:
        modalHandlers.handleEditEvent();
        break;
      case PopUpItem.ViewAsMember:
        modalHandlers.handleViewAsMember(event.id, event.year);
        break;
      default:
        console.log(`${item} button clicked`);
        break;
    }
  };

  return (
    <div>
      {!isDelete ? (
        // (represents the mobile edit popup)
        isMobile ? (
          <motion.div
            className="bg-bt-blue-400 fixed bottom-0 left-0 w-full flex flex-col py-5 rounded-t-lg"
            initial={isClicked ? { y: "100%" } : undefined}
            animate={isClicked ? { y: 0 } : { y: "100%" }}
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {editEventPopupItems?.map((item, idx) => (
              <PopupButton
                key={idx}
                popUpItem={item}
                clickEffect={handleButtonClick}
              />
            ))}
          </motion.div>
        ) : (
          <div></div>
        )
      ) : (
        // (used for both desktop and mobile)
        <div
          className="fixed inset-0 flex items-center justify-center w-full z-50 bg-bt-blue-700 bg-opacity-50"
          onClick={() => setIsDelete(false)}
        >
          <motion.div
            className="bg-bt-blue-400 w-[55%] md:w-[90%] max-w-[470px] h-auto md:h-[274px] flex flex-col py-7 rounded-lg text-white shadow-lg relative"
            transition={{
              type: "tween",
              ease: "easeInOut",
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DeletePopup setIsDelete={setIsDelete} event={event} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
