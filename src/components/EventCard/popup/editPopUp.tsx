import React, { forwardRef } from 'react';
import PopupButton from './popupButton';
import { ModalHandlers } from '@/pages/admin/home';
import { PopUpItem } from '../types';


interface PopupModalProps {
  editEventPopupItems: PopUpItem[] | null,
  modalHandlers: ModalHandlers;
  eventID: string;
  eventYear: number;
}

const PopupModal = forwardRef<HTMLDivElement, PopupModalProps>(({ editEventPopupItems, modalHandlers, eventID, eventYear}, ref) => {

  const handleButtonClick = (item: String) => {
    switch (item) {
      case PopUpItem.DeleteEvent:
        modalHandlers.handleEventDelete();
        break;
      case PopUpItem.EditEvent:
        modalHandlers.handleEditEvent();
        break;
      case PopUpItem.ViewAsMember:
        modalHandlers.handleViewAsMember(eventID, eventYear);
        break;
      default:
        console.log(`${item} button clicked`);
        break;   
    }
  };

  return (
    <div className="shadow-2xl w-[200px] absolute bg-events-card-bg flex flex-col gap-2 py-2 rounded-lg" ref={ref}>
      {editEventPopupItems?.map((item, idx) => (
        <PopupButton key={idx} popUpItem={item} clickEffect={handleButtonClick} />
      ))}
    </div>
  );
});

PopupModal.displayName = 'PopupModal';

export default PopupModal;
