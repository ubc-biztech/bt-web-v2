import React, { useState } from 'react';
import PopupButton from './popupButton';
import { motion } from "framer-motion";
import DeletePopup from './deletePopUp';
import PopupModal from './editPopUp';
import { BiztechEvent } from '@/types/types';

type Props = {
    isClicked: boolean,
    isMobile: boolean,
    isDelete: boolean,
    bizEvent: BiztechEvent | null,
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>
}

const popUpItems = [
    {
        title: 'Edit Event',
    },
    {
        title: 'View as Member',
    },
    {
        title: 'Delete Event',
    },
];


export default function MobilePopup({ isClicked, isMobile, isDelete, setIsDelete, bizEvent }: Props) {

    // toggle the view when the 'delete' icon is clicked 
    const handleButtonClick = (item: any) => {
        if (item.title === 'Delete Event') {
            setIsDelete(true)
            console.log('Delete button clicked here');
        } else {
            console.log(`${item.title} button clicked`);
        }
    };

    return (
        <div>
            {!isDelete ?
                // (represents the mobile edit popup)
                (isMobile ?
                    <motion.div
                        className="w-full bg-login-form-card fixed bottom-0 left-0 w-full flex flex-col py-5 rounded-t-lg"
                        initial={isClicked ? { y: "100%" } : undefined}
                        animate={isClicked ? { y: 0 } : { y: "100%" }}
                        transition={{
                            type: "tween",
                            ease: "easeInOut",
                            duration: 0.3,
                        }}
                        onClick={(e) => e.stopPropagation()} >
                        {popUpItems?.map(item => (
                            <PopupButton key={item.title} popUpItem={item} clickEffect={handleButtonClick} />
                        ))}
                    </motion.div>
                    :
                    <div></div>
                ) :
                // (used for both desktop and mobile)
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-events-navigation-bg bg-opacity-50 blur-background" onClick={() => setIsDelete(false)}>
                    <motion.div
                        className="w-full bg-login-form-card fixed bottom-0 left-0 md:bottom-[30%] md:left-[35%] md:w-[470px] md:h-[274px] flex flex-col py-7 rounded-t-lg md:rounded-lg text-white"
                        transition={{
                            type: "tween",
                            ease: "easeInOut",
                            duration: 0.3,
                        }}
                        onClick={(e) => e.stopPropagation()} >
                        <DeletePopup setIsDelete={setIsDelete} bizEvent={bizEvent} />
                    </motion.div>
                </div>}
        </div>
    );
};