// PopupModal.tsx
import Link from 'next/link';
import React, { useState } from 'react';

interface PopUpButtonProps {
    popUpItem: {
      title: string;
      link: string;
    };

    clickEffect: (item: any) => void;
}
  
const PopupButton: React.FC<PopUpButtonProps> = ({ popUpItem, clickEffect }) => {

  return (
    <Link href={popUpItem.link} className="hover:bg-events-edit-hover-bg w-full h-10 pt-2" onClick={() => clickEffect(popUpItem)}>
        <p className='p2 text-white text-left pl-4'>{popUpItem.title}</p>
    </Link>
  );
};

export default PopupButton;