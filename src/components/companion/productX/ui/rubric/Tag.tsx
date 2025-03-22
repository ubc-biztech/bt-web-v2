import React from "react";

interface TagProps {
    flag: boolean;
}

const Tag: React.FC<TagProps> = ({ flag }) => {
    if (flag) {
        return (
            <span className="text-[#4CC8BD] border-[#4CC8BD] border bg-[#23655F] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center">
                GRADED
            </span>
        );
    }
    return (
        <span className="text-[#FF4262] border-[#FF4262] border bg-[#A43B4C] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center">
            UNGRADED
        </span>
    );
};

export default Tag;
