import { z } from "zod";
import type { RegistrationQuestion } from "@/types";

/**
 * Avatar, soundtrack and role ids are stored verbatim in `dynamicResponses`, so
 * they must be confirmed with design before registration opens. Renaming one
 * after launch orphans every answer already submitted under the old id.
 */
export const HH_AVATAR_IDS = [
  "classic",
  "bloom",
  "shades",
  "propeller",
  "violet",
  "pizza",
] as const;

export type HHAvatarId = (typeof HH_AVATAR_IDS)[number];

export type HHAvatar = {
  id: HHAvatarId;
  label: string;
  /** Full circular BizBot render — the fill and the decoration are baked in. */
  src: string;
  /** The circle's fill, sampled from `src`. Backs the art while it loads. */
  color: string;
};

const AVATAR_ASSETS = "/assets/2026/hello-hacks/avatars";

/**
 * Intrinsic size of every avatar render. The art is only 110px wide, so it is
 * served as-is rather than run through the image optimiser, which otherwise
 * picks a srcset entry far below the size the hero displays it at.
 *
 * TODO(design): ask for 2x exports — the hero scales these up to 172px.
 */
export const HH_AVATAR_WIDTH = 110;
export const HH_AVATAR_HEIGHT = 109;

// Grid order follows the 1.2 frame: hearts, shades, propeller, then plain,
// headphones, pizza.
export const HH_AVATARS = [
  {
    id: "bloom",
    label: "Bloom",
    src: `${AVATAR_ASSETS}/bloom.png`,
    color: "#cdae5c",
  },
  {
    id: "shades",
    label: "Shades",
    src: `${AVATAR_ASSETS}/shades.png`,
    color: "#db85bd",
  },
  {
    id: "propeller",
    label: "Propeller",
    src: `${AVATAR_ASSETS}/propeller.png`,
    color: "#52b9a7",
  },
  {
    id: "classic",
    label: "Classic",
    src: `${AVATAR_ASSETS}/classic.png`,
    color: "#5c98cd",
  },
  {
    id: "violet",
    label: "Violet",
    src: `${AVATAR_ASSETS}/violet.png`,
    color: "#9571b5",
  },
  {
    id: "pizza",
    label: "Pizza",
    src: `${AVATAR_ASSETS}/pizza.png`,
    color: "#cd855c",
  },
] as const satisfies readonly HHAvatar[];

/**
 * Shown in the picker before anything is chosen, and as the fallback for an
 * unrecognised id. Named rather than indexed, because the grid order follows
 * the design frame and does not lead with this one.
 */
export const HH_DEFAULT_AVATAR: HHAvatar =
  HH_AVATARS.find(({ id }) => id === "classic") ?? HH_AVATARS[0];

/**
 * Resolves an avatar arriving from outside the form — the `avatar` query param
 * on the success route. Handles the `string | string[]` router shape, and falls
 * back to the first avatar so an unrecognised value never reaches an image path.
 */
export function resolveAvatar(value?: string | string[]): HHAvatar {
  const id = Array.isArray(value) ? value[0] : value;

  return HH_AVATARS.find((avatar) => avatar.id === id) ?? HH_DEFAULT_AVATAR;
}

export const HH_TRACK_IDS = [
  "hh-tune-1",
  "hh-tune-2",
  "hh-tune-3",
  "hh-tune-4",
] as const;

export type HHTrackId = (typeof HH_TRACK_IDS)[number];

export type HHTrack = {
  id: HHTrackId;
  title: string;
  artist: string;
  src: string;
};

// TODO(design): replace placeholder titles/artists once Jade confirms them.
export const HH_TRACKS = [
  {
    id: "hh-tune-1",
    title: "Late Night Build",
    artist: "BizTech Beats",
    src: "/assets/2026/hello-hacks/audio/hh-tune-1.m4a",
  },
  {
    id: "hh-tune-2",
    title: "Coffee Shop Jazz",
    artist: "Lil Tao",
    src: "/assets/2026/hello-hacks/audio/hh-tune-2.m4a",
  },
  {
    id: "hh-tune-3",
    title: "Bay Breeze",
    artist: "Kevina Xiao",
    src: "/assets/2026/hello-hacks/audio/hh-tune-3.m4a",
  },
  {
    id: "hh-tune-4",
    title: "Jump Start",
    artist: "University of British Chudlumbia",
    src: "/assets/2026/hello-hacks/audio/hh-tune-4.m4a",
  },
] as const satisfies readonly HHTrack[];

export const HH_ROLE_IDS = [
  "developer",
  "designer",
  "product-manager",
  "undecided",
] as const;

export type HHRoleId = (typeof HH_ROLE_IDS)[number];

export type HHRole = {
  id: HHRoleId;
  label: string;
  description: string;
};

export const HH_ROLES = [
  {
    id: "developer",
    label: "Developer",
    description: "I'll be writing code and building the technical side",
  },
  {
    id: "designer",
    label: "Designer",
    description: "I'll be shaping the look, feel, and user experience",
  },
  {
    id: "product-manager",
    label: "Product Manager",
    description: "I'll be leading strategy and coordinating the team",
  },
  {
    id: "undecided",
    label: "Not sure yet",
    description: "I'm open to figuring it out at the event",
  },
] as const satisfies readonly HHRole[];

export const HH_CODING_CONFIDENCE_IDS = ["1", "2", "3", "4", "5"] as const;

export type HHCodingConfidenceId = (typeof HH_CODING_CONFIDENCE_IDS)[number];

export const HH_WORKSHOP_CHOICES = ["Yes", "No"] as const;

export type HHWorkshopChoice = (typeof HH_WORKSHOP_CHOICES)[number];

export const HH_HACKATHONS_CHAR_LIMIT = 50;
export const HH_TEN_K_WORD_LIMIT = 150;
export const HH_BEIGE_FLAG_WORD_LIMIT = 75;
/** Teammate boxes take a name, and were reaching the backend unbounded. */
export const HH_TEAMMATE_CHAR_LIMIT = 50;

export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const HELLO_HACKS_REGISTRATION_QUESTIONS = [
  {
    questionId: "hh_avatar",
    label: "Which BizBot are you?",
    type: "SELECT",
    required: true,
    choices: HH_AVATAR_IDS.join(","),
  },
  {
    questionId: "hh_soundtrack",
    label: "What's playing while you build?",
    type: "SELECT",
    required: true,
    choices: HH_TRACK_IDS.join(","),
  },
  {
    questionId: "hh_role",
    label: "What's your role?",
    type: "SELECT",
    required: true,
    choices: HH_ROLE_IDS.join(","),
  },
  {
    questionId: "hh_coding_confidence",
    label: "How confident are you in your coding abilities?",
    type: "SELECT",
    required: true,
    choices: HH_CODING_CONFIDENCE_IDS.join(","),
  },
  {
    questionId: "hh_hackathons_attended",
    label: "How many hackathons have you attended?",
    type: "TEXT",
    required: true,
    charLimit: HH_HACKATHONS_CHAR_LIMIT,
  },
  {
    questionId: "hh_workshop",
    label:
      "Will you be attending the pre-hackathon workshop? (September 24 from 6:30pm - 9:00pm)",
    type: "SELECT",
    required: true,
    choices: HH_WORKSHOP_CHOICES.join(","),
  },
  {
    questionId: "hh_ten_k",
    label: "If you had 10k right now, what would you do with it and why?",
    type: "TEXT",
    required: true,
    charLimit: HH_TEN_K_WORD_LIMIT,
  },
  {
    questionId: "hh_beige_flag",
    label: "What's your beige flag?",
    type: "TEXT",
    required: true,
    charLimit: HH_BEIGE_FLAG_WORD_LIMIT,
  },
  {
    questionId: "hh_teammate_1",
    label: "Teammate 1",
    type: "TEXT",
    required: false,
    charLimit: HH_TEAMMATE_CHAR_LIMIT,
  },
  {
    questionId: "hh_teammate_2",
    label: "Teammate 2",
    type: "TEXT",
    required: false,
    charLimit: HH_TEAMMATE_CHAR_LIMIT,
  },
  {
    questionId: "hh_teammate_3",
    label: "Teammate 3",
    type: "TEXT",
    required: false,
    charLimit: HH_TEAMMATE_CHAR_LIMIT,
  },
] satisfies readonly RegistrationQuestion[];

const teammateName = z
  .string()
  .trim()
  .max(
    HH_TEAMMATE_CHAR_LIMIT,
    `Keep this under ${HH_TEAMMATE_CHAR_LIMIT} characters`,
  )
  .optional();

const wordLimitedAnswer = (message: string, wordLimit: number) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine(
      (value) => countWords(value) <= wordLimit,
      `Keep this under ${wordLimit} words`,
    );

export const HelloHacksRegistrationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  studentId: z.string().trim().optional(),
  year: z.string().trim().min(1, "Year is required"),
  faculty: z.string().trim().min(1, "Faculty is required"),
  major: z.string().trim().min(1, "Specialization is required"),
  dietaryRestrictions: z.string().trim().optional(),
  avatar: z.enum(HH_AVATAR_IDS, {
    required_error: "Pick an avatar",
    invalid_type_error: "Pick a valid avatar",
  }),
  soundtrack: z.enum(HH_TRACK_IDS, {
    required_error: "Choose a song",
    invalid_type_error: "Choose a valid song",
  }),
  role: z.enum(HH_ROLE_IDS, {
    required_error: "Select a role",
    invalid_type_error: "Select a valid role",
  }),
  codingConfidence: z.enum(HH_CODING_CONFIDENCE_IDS, {
    required_error: "Select a rating",
    invalid_type_error: "Select a valid rating",
  }),
  hackathonsAttended: z
    .string()
    .trim()
    .min(1, "Tell us how many hackathons you've attended")
    .max(
      HH_HACKATHONS_CHAR_LIMIT,
      `Keep this under ${HH_HACKATHONS_CHAR_LIMIT} characters`,
    ),
  workshop: z.enum(HH_WORKSHOP_CHOICES, {
    required_error: "Select an option",
    invalid_type_error: "Select a valid option",
  }),
  tenKPlan: wordLimitedAnswer(
    "Tell us what you would do with $10k",
    HH_TEN_K_WORD_LIMIT,
  ),
  beigeFlag: wordLimitedAnswer(
    "Tell us your beige flag",
    HH_BEIGE_FLAG_WORD_LIMIT,
  ),
  teammate1: teammateName,
  teammate2: teammateName,
  teammate3: teammateName,
});

export type HelloHacksRegistrationValues = z.infer<
  typeof HelloHacksRegistrationSchema
>;
