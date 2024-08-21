import React, { forwardRef } from 'react';
import PopupButton from './popupButton';

interface PopUpItem {
  title: string;
}

interface PopupModalProps {
  popUpItems: PopUpItem[] | null,
  setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
}



const PopupModal = forwardRef<HTMLDivElement, PopupModalProps>(({ popUpItems, setIsDelete }, ref) => {
 
  const handleButtonClick = (item: any) => {
    if (item.title === 'Delete Event') {
        setIsDelete(true)
        console.log('Delete button clicked');
    } else {
        console.log(`${item.title} button clicked`);
    }
  };

  return (
    <div className="shadow-2xl w-[200px] absolute bg-events-card-bg flex flex-col gap-2 py-2 rounded-lg" ref={ref}>
      {popUpItems?.map(item => (
        <PopupButton key={item.title} popUpItem={item} clickEffect={handleButtonClick} />
      ))}
    </div>
  );
});

PopupModal.displayName = 'PopupModal';

export default PopupModal;
