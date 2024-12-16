// PopupModal.tsx
import React from 'react';

interface PopUpButtonProps {
    popUpItem: String;
    clickEffect: (item: any) => void;
}

const PopupButton: React.FC<PopUpButtonProps> = ({ popUpItem, clickEffect }) => {

  return (
    <button className="hover:bg-events-edit-hover-bg w-full h-10 pt-2" onClick={() => clickEffect(popUpItem)}>
        <p className='p2 text-white text-left pl-4'>{popUpItem}</p>
    </button>
  );
};

export default PopupButton;