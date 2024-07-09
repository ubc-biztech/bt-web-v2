import React, { useState } from 'react';
import PopupButton from './popup-button';

interface PopUpItem {
  title: string;
  link: string;
}

interface PopupModalProps {
  popUpItems: PopUpItem[] | null,
  setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
}



const PopupModal: React.FC<PopupModalProps> = ({  popUpItems, setIsDelete }) => {

  // toggle the view when the 'delete' icon is clicked 
  const handleButtonClick = (item: any) => {
    if (item.title === 'Delete Event') {
        setIsDelete(true)
        console.log('Delete button clicked here bud');
    } else {
        console.log(`${item.title} button clicked`);
    }
  };

  return (
    <div className="shadow-2xl w-[200px] absolute bg-events-card-bg flex flex-col gap-2 py-2">
      {popUpItems?.map(item => (
        <PopupButton key={item.title} popUpItem={item} clickEffect={handleButtonClick} />
      ))}
    </div>
  );
};

export default PopupModal;
