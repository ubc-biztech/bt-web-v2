import React, { useState } from "react";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import { BiztechEvent } from "@/types/types";
import { fetchBackend } from "@/lib/db";

interface Props {
  setIsDelete: React.Dispatch<React.SetStateAction<boolean>>;
  event: BiztechEvent | null;
}

const DeletePopup: React.FC<Props> = ({ setIsDelete, event }) => {
  const handleDeleteEvent = async () => {
    try {
      const response = await fetchBackend({
        endpoint: `/events/${event?.id}/${event?.year}`,
        method: "DELETE",
      });
      window.location.reload();
    } catch (error) {
      alert("Error deleting event");
    }
  };

  return (
    <div className="container mx-auto text-center flex flex-col items-center justify-center p-6">
      <button
        onClick={() => setIsDelete(false)}
        className="absolute top-1 right-3"
      >
        <h4 className="text-white">&times;</h4>
      </button>
      <p className="p3 text-white">Are you sure you want to delete</p>
      <h5 className="text-white my-3">[ {event?.ename} ]</h5>
      <p className="p3 underline text-white">This action cannot be undone</p>
      <button
        className="w-[220px] h-[44px] bg-bt-red-200 rounded-lg text-bt-blue-400 m-3 flex items-center justify-center space-x-2"
        onClick={handleDeleteEvent}
      >
        <DeleteSharpIcon />
        <p className="font-bold">Delete Event</p>
      </button>
    </div>
  );
};

export default DeletePopup;
