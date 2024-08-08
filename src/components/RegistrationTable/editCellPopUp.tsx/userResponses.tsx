import React from 'react';
import { RegQuestionData, UserResponse } from '../../../types';

interface UserResponsesProps {
    questions: RegQuestionData[];
    responses: { [key: string]: UserResponse };
}

const UserResponses: React.FC<UserResponsesProps> = ({ questions, responses }) => {
    console.log(questions);
    return (
        <div className="text-white p-2">
            {questions.map((question, index) => {
                const questionData = question.M;

                const label = questionData.label.S;
                const questionId = questionData.questionId.S;
                const answer = responses[questionId]?.S || 'No response';

                return (
                    <div key={index} className='mb-3 w-full max-w-full overflow-hidden'>
                        <p className="text-baby-blue break-words whitespace-normal">{label}</p>
                        <p className="text-white break-words whitespace-normal">{answer}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default UserResponses;