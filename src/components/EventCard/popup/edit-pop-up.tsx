import React, { forwardRef } from 'react';
import PopupButton from './popup-button';

interface PopUpItem {
  title: string;
  link: string;
}

interface PopupModalProps {
  popUpItems: PopUpItem[] | null,
  setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
}


// PopUpModal used only in the Desktop display.
// popUpItems: the buttons to be displayed on the PopUp
// setIsDelete: the state modifier passed in from event-card to that when the delete button is clicked, 
// the delete popup will be rendered
const PopupModal = forwardRef<HTMLDivElement, PopupModalProps>(({ popUpItems, setIsDelete }, ref) => {
  // toggle the view when the 'delete' icon is clicked 
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
