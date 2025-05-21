import React from "react";
import Modal from "./Modal";
import { TriangleAlert, X } from "lucide-react";
import Button from "./Button";

interface SubmissionErrorModalProps {
  modal: boolean;
  setModal: (modal: boolean) => void;
  onExit: () => void;
}

const SubmissionErrorModal: React.FC<SubmissionErrorModalProps> = ({
  modal,
  setModal,
  onExit,
}) => {
  return (
    <Modal
      show={modal}
      onClose={() => {
        setModal(false);
      }}
    >
      <>
        <div className="w-full flex flex-row justify-end h-4">
          <X
            size={20}
            color="#ADAFE4"
            className="cursor-pointer"
            onClick={() => {
              setModal(false);
            }}
          />
        </div>
        <div className="flex flex-row gap-2">
          <TriangleAlert size={24} />
          <span>ERROR: Failed to create team.</span>
        </div>
        <span className="text-[#ADAFE4] mt-8">
          One or more team members may not be valid. Please try again
        </span>
        <div className="flex flex-row gap-2 mt-8">
          <Button
            label="TRY AGAIN"
            Icon={null}
            className="hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-56 h-10 hover:bg-opacity-100 bg-opacity-0"
            onClick={onExit}
          />
        </div>
      </>
    </Modal>
  );
};

export default SubmissionErrorModal;
