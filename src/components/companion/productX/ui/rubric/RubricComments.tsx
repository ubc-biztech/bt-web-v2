import React from "react";
import Box from "../Box";
import Button from "../Button";

interface RubricCommentsProps {
    feedback: {
        [key: string]: string;
    };
}

const RubricComments: React.FC<RubricCommentsProps> = ({ feedback }) => {
    return (
        <div>
            <div className="w-full flex flex-row items-start justify-start mt-24">
                <div className="text-lg w-1/5 h-36 flex items-center justify-end">
                    <span className="mr-8">COMMENTS</span>
                </div>
                <div className="w-full flex flex-col gap-5">
                    {Object.entries(feedback).map(([key, comment], index) => (
                        <div className="w-full h-36" key={index}>
                            <Box innerShadow={42} className="text-md p-4">
                                {comment}
                            </Box>
                        </div>
                    ))}

                    <div className="w-full h-12">
                        <Button
                            label="+ ADD ADDITIONAL COMMENTS"
                            Icon={null}
                            className="hover:text-[#000000] bg-[#41437D] border border-dashed border-[#41437D] text-[#41437D] w-full h-10 hover:bg-opacity-100 bg-opacity-0"
                            onClick={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RubricComments;
