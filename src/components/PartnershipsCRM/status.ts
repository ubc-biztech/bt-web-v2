export const statusMeta = {
  prospecting: {
    label: "Prospecting",
    chipClassName: "border-[#7396D5]/40 bg-[#7396D5]/15 text-[#C7D8F8]",
    dotClassName: "bg-[#7396D5]",
  },
  pitched: {
    label: "Pitched",
    chipClassName: "border-[#6CA0FF]/40 bg-[#6CA0FF]/15 text-[#C8DBFF]",
    dotClassName: "bg-[#6CA0FF]",
  },
  reached_out: {
    label: "Reached Out",
    chipClassName: "border-[#7CA1BA]/40 bg-[#7CA1BA]/15 text-[#CDE5F4]",
    dotClassName: "bg-[#7CA1BA]",
  },
  shortlist: {
    label: "Shortlist",
    chipClassName: "border-[#AE7FE8]/40 bg-[#AE7FE8]/15 text-[#E5D4FF]",
    dotClassName: "bg-[#AE7FE8]",
  },
  in_conversation: {
    label: "In Conversation",
    chipClassName: "border-[#6AB8C8]/40 bg-[#6AB8C8]/15 text-[#CCF2F8]",
    dotClassName: "bg-[#6AB8C8]",
  },
  followed_up: {
    label: "Followed Up",
    chipClassName: "border-[#78A8F2]/40 bg-[#78A8F2]/15 text-[#D3E4FF]",
    dotClassName: "bg-[#78A8F2]",
  },
  confirmed: {
    label: "Confirmed",
    chipClassName: "border-[#75D450]/40 bg-[#75D450]/15 text-[#D6F5C9]",
    dotClassName: "bg-[#75D450]",
  },
  paid: {
    label: "Paid",
    chipClassName: "border-[#57C98F]/40 bg-[#57C98F]/15 text-[#C8F4DE]",
    dotClassName: "bg-[#57C98F]",
  },
  declined: {
    label: "Declined",
    chipClassName: "border-[#F59DAA]/40 bg-[#F59DAA]/15 text-[#FFD8DE]",
    dotClassName: "bg-[#F59DAA]",
  },
  backed_out: {
    label: "Backed Out",
    chipClassName: "border-[#FFB280]/40 bg-[#FFB280]/15 text-[#FFE4CE]",
    dotClassName: "bg-[#FFB280]",
  },
} as const;

export type KnownPartnerStatus = keyof typeof statusMeta;

export const KNOWN_STATUS_VALUES = Object.keys(
  statusMeta,
) as KnownPartnerStatus[];

export const toStatusLabel = (status: string) => {
  const knownMeta = statusMeta[status as KnownPartnerStatus];
  if (knownMeta) return knownMeta.label;

  return status
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
