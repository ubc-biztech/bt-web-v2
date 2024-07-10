import React, { useState } from 'react';
import PopupButton from './popup-button';
import { motion } from "framer-motion";
import DeletePopup from './delete-pop-up';
import PopupModal from './edit-pop-up';

type Props = {
    isClicked: boolean,
    isMobile: boolean,
    isDelete: boolean,
    bizEvent: string,
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>
}

const popUpItems = [
    {
        title: 'Edit Event',
        link: 'javascript:void(0)',
    },
    {
        title: 'View as Member',
        link: 'javascript:void(0)',
    },
    {
        title: 'Delete Event',
        link: 'javascript:void(0)',
    },
];


// file that contains the pop up which displays when the 'more' icon is clicked on mobile screens
// this file also contains the popup that displays for BOTH desktop and mobile when the 'delete event' button
// is clicked.
// isClicked: boolean state for if the 'more' icon is clicked
// isMobile: boolean state for if on a mobile device
// isDelete: boolean state for if the delete button is clicked
// setIsDelete: state modifier for isDelete
// bizEvent: the event name that the 'more' icon was clicked on (string)
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
                // only render the div below if we are on mobile screen
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
                // the below is only rendered if the delete button is clicked
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