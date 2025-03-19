// import Box from "../ui/rubric/RubricCell";
// import Button from "../ui/Button";
// // import { fetchRubricContents, fetchMetrics, ScoringMetric, defaultScoring, mapGrades } from "@/components/companion/productX/constants/rubricContents";
// import { TriangleAlert, X } from "lucide-react";
// import React, { useEffect, useState } from "react";
// import RubricCell from "../ui/rubric/RubricCell";

// const judgingRatings = ["1 - Poor", "2 - Fair", "3 - Average", "4 - Good", "5 - Excellent"];

// interface Score {
//   N: string;
// }

// interface FeedbackEntry {
//   judgeID: string;
//   scores: Record<string, Score>;
//   feedback: string;
//   createdAt: string;
// }

// interface RubricProps {
//   round: string;
//   teamName: string;
//   report: FeedbackEntry[];
//   showRubric: (arg0: boolean) => void;
// }

// const Rubric: React.FC<RubricProps> = ({ round, teamName, report, showRubric }) => {
//   const metrics = fetchMetrics; // constants/productx-scoringMetrics.ts
//   const [scoring, setScoring] = useState<ScoringMetric>(mapGrades({ grades: report[0].scores }) || defaultScoring);

//   // TODO : change from hardcoded report[0] to do the following: 1. display overall raw scores, 2. display each indiviudal grading rubric
//   const judgingRubric = fetchRubricContents(metrics);
//   useEffect(() => {
//     document.body.style.overflow = "hidden";

//     return () => {
//       document.body.style.overflow = "auto";
//     };
//   }, []); // disabled scroll when rubric is overlayed

//   // kill me
//   const isGraded = (grades: Record<string, { N: string }>) => {
//     return Object.values(grades).every((grade) => Number(grade.N) !== 0);
//   }; // expecting to deal with Nkeys

//   const date = new Date(report[0].createdAt);
//   const formattedDateTime = `${date
//     .toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric"
//     })
//     .toUpperCase()} ${date.toLocaleTimeString("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true
//   })}`;

//   return (
//     <>
//       <div className='top-0 left-0 w-screen h-screen scroll overflow-y-auto fixed z-30 bg-[#020319] flex flex-col items-center px-14'>
//         <div className='w-full flex flex-row justify-between mt-36'>
//           <div className='flex flex-row gap-5 items-center'>
//             <header className='text-xl'>
//               ROUND {round}: {teamName}
//             </header>

//             {/* Tags */}
//             {isGraded(report[0].scores) ? (
//               <span className='text-[#4CC8BD] border-[#4CC8BD] border bg-[#23655F] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center'>
//                 GRADED
//               </span>
//             ) : (
//               <span className='text-[#FF4262] border-[#FF4262] border bg-[#A43B4C] bg-opacity-70 px-4 rounded-full h-10 flex flex-row items-center justify-center'>
//                 UNGRADED
//               </span>
//             )}
//           </div>
//           <div className='flex flex-row gap-3 items-center text-[#898BC3]'>
//             <span>Last Edited: {formattedDateTime}</span>
//             <span>|</span>
//             <span
//               className='underline cursor-pointer z-50'
//               onClick={() => {
//                 showRubric(false);
//               }}
//             >
//               Return to Home
//             </span>
//           </div>
//         </div>

//         {/* Divider */}
//         <div className='w-full h-[1px] bg-[#41437D] mt-3'>&nbsp; </div>

//         {/* Grid */}
//         <figure className='w-full grid grid-cols-6 grid-rows-5 gap-0 -mt-12'>
//           <div />
//           {judgingRatings.map((rating, index) => (
//             <div key={`${rating}-${index}`} className='flex flex-row items-end justify-center p-8'>
//               <span className='text-lg'>{rating}</span>
//             </div>
//           ))}

//           {/* For every category.... */}
//           {Object.keys(judgingRubric).map((categoryKey, index) => {
//             const category = categoryKey as keyof typeof judgingRubric;

//             const setRating = (rating: number) => {
//               if (scoring[category] === rating) {
//                 setScoring((prevState) => ({
//                   ...prevState,
//                   [category]: 0
//                 }));
//               } else {
//                 setScoring((prevState) => ({
//                   ...prevState,
//                   [category]: rating
//                 }));
//               }
//             };

//             return (
//               <>
//                 <div key={`category-${categoryKey}-${index}`} className='text-lg w-full h-56 flex items-center justify-end p-8'>
//                   {category}
//                 </div>

//                 {/* For every criteria.... */}
//                 {judgingRubric[category].map((question, pos) => {
//                   const rating = pos + 1;
//                   return (
//                     <div className='w-full h-56 text-[14px]' key={`${categoryKey}-question-${pos}`}>
//                       <RubricCell
//                         innerShadow={32}
//                         selected={scoring[category] === rating}
//                         key={index}
//                         handleClick={() => {}}
//                         className='flex flex-col  text-center p-4 pt-8'
//                       >
//                         {question}
//                       </RubricCell>
//                     </div>
//                   );
//                 })}
//               </>
//             );
//           })}
//         </figure>

//         {/* Comments */}
//         <div className='w-full flex flex-row items-start justify-start mt-24'>
//           <div className='text-lg w-1/5 h-36 flex items-center justify-end'>
//             <span className='mr-8'>COMMENTS</span>
//           </div>
//           <div className='w-full flex flex-col gap-5'>
//             {[report[0].feedback].map(
//               (
//                 comment,
//                 index // fix later
//               ) => (
//                 <div className='w-full h-36 mb-10' key={index}>
//                   <Box innerShadow={42} className='text-md p-4'>
//                     {comment}
//                   </Box>
//                 </div>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Rubric;
