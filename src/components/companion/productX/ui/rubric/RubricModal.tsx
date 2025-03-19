import React from "react";
import Modal from "../Modal";
import { TriangleAlert, X } from "lucide-react";
import Button from "../Button";

interface RubricModalProps {
    modal: boolean;
    setModal: (modal: boolean) => void;
    showRubric: (arg0: boolean) => void;
}

const RubricModal: React.FC<RubricModalProps> = ({
    modal,
    setModal,
    showRubric,
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
                    <span>
                        WARNING: Are you sure you want to leave this page?
                    </span>
                </div>
                <span className="text-[#ADAFE4] mt-8">
                    All grading progress will be lost.
                </span>
                <div className="flex flex-row gap-2 mt-8">
                    <Button
                        label="EXIT PAGE"
                        Icon={null}
                        className="hover:text-[#000000] bg-[#FF4262] border border-[#FF4262] text-[#FF4262] w-24 h-10 hover:bg-opacity-100 bg-opacity-0"
                        onClick={() => {
                            showRubric(false);
                        }}
                    />
                    <Button
                        label="BACK TO GRADING"
                        Icon={null}
                        className="hover:text-[#000000] hover:bg-white bg-[#198E7C] border border-[#198E7C] text-white w-44 h-10"
                        onClick={() => {
                            setModal(false);
                        }}
                    />
                </div>
            </>
        </Modal>
    );
};

export default RubricModal;
