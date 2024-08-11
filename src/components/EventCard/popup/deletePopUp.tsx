import React, { useState } from 'react';
import DeleteSharpIcon from '@mui/icons-material/DeleteSharp';
import { BiztechEvent } from '@/types/biztechEvent';


interface Props {
    setIsDelete: React.Dispatch<React.SetStateAction<boolean>>,
    bizEvent: BiztechEvent | null,
}


const DeletePopup: React.FC<Props> = ({ setIsDelete, bizEvent }) => {

    const handleDeleteEvent = () => {
        // TODO: Handle deletion of 'bizEvent' here
        console.log('Deleting event: ', bizEvent?.id, bizEvent?.year);
    }

    return (
        <div className='container mx-auto text-center flex flex-col items-center justify-center p-6'>
            <button onClick={() => setIsDelete(false)} className="absolute top-1 right-3">
                <h4 className='text-white'>&times;</h4>
            </button>
            <p className='p3 text-white'>Are you sure you want to delete</p>
            <h5 className='text-white my-3'>[ {bizEvent?.ename} ]</h5>
            <p className='p3 underline text-white'>This action cannot be undone</p>
            <button className="w-[220px] h-[44px] bg-light-red rounded-lg text-login-form-card m-3 flex items-center justify-center space-x-2" onClick={handleDeleteEvent}>
                <DeleteSharpIcon />
                <p className='font-bold'>Delete Event</p>
            </button>
        </div>
    );
};

export default DeletePopup;