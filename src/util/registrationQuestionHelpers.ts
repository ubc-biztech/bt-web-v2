export const cleanOtherQuestions = (answer: string) => {
  if (!answer) return answer;
  let otherIdx = answer.indexOf("Other:");
  if (otherIdx < 0) {
    otherIdx = answer.indexOf("Other");
    if (otherIdx >= 0) {
      let choicesSplit = answer.split(",");
      choicesSplit = choicesSplit.filter(
        (choice) => choice.trim().toLowerCase() !== "other",
      );
      return choicesSplit.join(",");
    }
    return answer;
  }
  const choices = answer.slice(0, otherIdx) + answer.slice(otherIdx + 6);
  const choicesSplit = choices.split(",");
  for (let i = 0; i < choicesSplit.length; i++) {
    choicesSplit[i] = choicesSplit[i].trim();
  }
  return choicesSplit.join(",");
};
