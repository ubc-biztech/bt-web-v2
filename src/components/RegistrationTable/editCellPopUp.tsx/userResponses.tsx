import React from 'react';
import { RegistrationQuestion, UserResponseList } from '../../../types';

interface UserResponsesProps {
    questions: RegistrationQuestion[];
    responses: UserResponseList;
}

const UserResponses: React.FC<UserResponsesProps> = ({ questions, responses }) => {
    return (
        <div className="text-white p-2">
            {questions.map((question, index) => {

                const label = question.label;
                const questionId = question.questionId;
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