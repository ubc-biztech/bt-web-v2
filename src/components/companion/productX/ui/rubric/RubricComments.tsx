import { useState } from "react";
import React from "react";
import { metrics } from "../../constants/rubricContents";
import { useUserRegistration } from "@/pages/companion";
import Box from "../Box";

interface RubricCommentsProps {
  feedback: { [key: string]: string };
  setFeedback: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
}

const RubricComments: React.FC<RubricCommentsProps> = ({
  feedback,
  setFeedback,
}) => {
  const [openIndex, setOpenIndex] = useState<null | number>(null);
  const { userRegistration } = useUserRegistration();

  return (
    <div className="w-full flex flex-row items-start gap-8 mt-5">
      <div className="text-white font-semibold text-lg w-[200px] text-left">
        COMMENTS
      </div>

      {/* Comments Section */}
      <div className="flex-1 flex flex-col gap-3">
        {["General Feedback", ...metrics].map((topic, index) => {
          const comment = feedback[topic] || "";
          const hasComment = comment.trim() !== "";
          const isJudge = userRegistration?.isPartner;

          return (
            <Box innerShadow={32} className="w-full relative" key={topic}>
              <button
                className={`w-full px-5 py-3 rounded-lg shadow-md text-left flex justify-between items-center ${
                  !hasComment && !isJudge ? "cursor-not-allowed opacity-50" : ""
                }`}
                onClick={() =>
                  (isJudge || hasComment) &&
                  setOpenIndex(openIndex === index ? null : index)
                }
                disabled={!hasComment && !isJudge}
              >
                <span className="text-[#898BC3]">
                  <span className="font-normal ">
                    Topic: <span className="font-bold">{topic}</span>
                  </span>
                </span>
                <span className="text-[#898BC3] text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (hasComment || isJudge) && (
                <div className="w-full bg-[#151528] p-5 mt-2 rounded-lg shadow-md flex flex-col">
                  <textarea
                    className={`w-full bg-[#151528] text-white resize-none p-2 rounded-md ${
                      !isJudge ? "pointer-events-none select-none" : ""
                    }`}
                    defaultValue={comment}
                    onBlur={(e) => {
                      if (isJudge) {
                        setFeedback((prev) => ({
                          ...prev,
                          [topic]: e.target.value,
                        }));
                      }
                    }}
                    readOnly={!isJudge}
                  />
                </div>
              )}
            </Box>
          );
        })}
      </div>
    </div>
  );
};

export default RubricComments;
