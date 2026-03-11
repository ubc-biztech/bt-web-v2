import React from "react";
import { RegistrationQuestion, UserResponseList } from "../../../types";

interface UserResponsesProps {
  questions: RegistrationQuestion[];
  responses: UserResponseList;
}

const UserResponses: React.FC<UserResponsesProps> = ({
  questions,
  responses,
}) => {
  return (
    <div className="text-white p-2">
      {questions.map((question) => {
        const label = question.label;
        const questionId = question.questionId;
        const answer = responses ? responses[questionId] : "No response";

        return (
          <div
            key={questionId}
            className="mb-3 w-full max-w-full overflow-hidden"
          >
            <p className="text-bt-blue-100 break-words whitespace-normal">
              {label}
            </p>
            <p className="text-white break-words whitespace-normal">{answer}</p>
          </div>
        );
      })}
    </div>
  );
};

export default UserResponses;
