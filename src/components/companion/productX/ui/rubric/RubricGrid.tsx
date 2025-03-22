import React from "react";
import RubricCell from "./RubricCell";
import { ScoringMetric, ScoringRecord } from "@/components/companion/productX/types";
import { ratings, rubricContentsMapping, mapMetricsToCategories } from "../../constants/rubricContents";

// ? example usage of setScoring
// setScoring([
//     { metric1: "Originality & Creativity", rating: 5 },
//     { metric2: "Technical Implementation", rating: 4 },
//     { metric3: "User Experience (UX)", rating: 3 },
//     { metric4: "Problem-Solving", rating: 2 },
//     { metric5: "Presentation & Communication", rating: 1 }
// ]);

interface RubricGridProps {
  scoring: ScoringRecord;
  setScoring: React.Dispatch<React.SetStateAction<ScoringRecord>>;
  editable: boolean;
}

const RubricGrid: React.FC<RubricGridProps> = ({ scoring, setScoring, editable }) => {
  const metrics = Object.keys(scoring) as ScoringMetric[];

  const getRating = (metric: ScoringMetric) => {
    return scoring[metric];
  };

  const setRating = (metric: ScoringMetric, rating: number) => {
    if (!editable) {
      return;
    }
    setScoring((prevState: ScoringRecord) => ({
      ...prevState,
      [metric]: rating
    }));
  };

  return (
    <figure className='w-full grid grid-cols-6 grid-rows-5 gap-0 -mt-12'>
      {/* All possible ratings */}
      <div />
      {ratings.map((rating, index) => (
        <div key={`${rating}-${index}`} className='flex flex-row items-end justify-center p-8'>
          <span className='text-lg'>{rating}</span>
        </div>
      ))}

      {/* For every category.... */}
      {metrics.map((category, index) => {
        const questions = rubricContentsMapping[category];
        return (
          <>
            <div key={`category-${category}-${index}`} className='text-lg w-full h-56 flex items-center justify-end p-8'>
              {mapMetricsToCategories[category]}
            </div>

            {/* For every criteria.... */}
            {questions.map((question, pos) => {
              const rating = pos + 1;
              return (
                <div className='w-full h-56 text-[14px]' key={`${category}-question-${pos}`}>
                  <RubricCell
                    innerShadow={32}
                    selected={getRating(category) === rating}
                    key={index}
                    handleClick={() => {
                      setRating(category, rating);
                    }}
                    className='flex flex-col text-center p-4 pt-8 h-full'
                  >
                    {question}
                  </RubricCell>
                </div>
              );
            })}
          </>
        );
      })}
    </figure>
  );
};

export default RubricGrid;
