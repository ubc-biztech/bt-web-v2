export const formatDate = (createdAt: string) => {
  const date = new Date(createdAt);
  const formattedDateTime = `${date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    .toUpperCase()} ${date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;

  return formattedDateTime;
};
