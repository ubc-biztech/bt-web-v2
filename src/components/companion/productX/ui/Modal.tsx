import React, { useEffect } from "react";
import Box from "./Box";

interface ModalProps {
    show: boolean;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, children, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div
            className={`top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-black ${
                show
                    ? "opacity-100 bg-opacity-50 pointer-events-auto backdrop-blur-sm"
                    : " backdrop-blur-0 opacity-0 pointer-events-none"
            } flex flex-col items-center justify-center transition duration-500 ease-in-out`}
            onClick={onClose}
        >
            <div className="w-[40em] h-64" onClick={(e) => e.stopPropagation()}>
                <Box
                    innerShadow={20}
                    className="flex flex-col items-center justify-start p-8"
                >
                    {children}
                </Box>
            </div>
        </div>
    );
};

export default Modal;
