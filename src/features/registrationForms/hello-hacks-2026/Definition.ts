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
};

// TODO(design): swap placeholder labels for the final BizBot names + art.
export const HH_AVATARS = [
  { id: "classic", label: "Classic" },
  { id: "bloom", label: "Bloom" },
  { id: "shades", label: "Shades" },
  { id: "propeller", label: "Propeller" },
  { id: "violet", label: "Violet" },
  { id: "pizza", label: "Pizza" },
] as const satisfies readonly HHAvatar[];

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

export const HH_ANSWER_CHAR_LIMIT = 300;

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
    questionId: "hh_why_attend",
    label: "Why do you want to attend HelloHacks?",
    type: "TEXT",
    required: true,
    charLimit: HH_ANSWER_CHAR_LIMIT,
  },
  {
    questionId: "hh_project_idea",
    label: "Tell us about something you've built or want to build.",
    type: "TEXT",
    required: true,
    charLimit: HH_ANSWER_CHAR_LIMIT,
  },
  {
    questionId: "hh_skills_goal",
    label: "What skills do you hope to gain from participating in HelloHacks?",
    type: "TEXT",
    required: true,
    charLimit: HH_ANSWER_CHAR_LIMIT,
  },
] satisfies readonly RegistrationQuestion[];

const shortAnswer = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .max(
      HH_ANSWER_CHAR_LIMIT,
      `Keep this under ${HH_ANSWER_CHAR_LIMIT} characters`,
    );

export const HelloHacksRegistrationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  studentId: z.string().trim().optional(),
  year: z.string().trim().min(1, "Year is required"),
  faculty: z.string().trim().min(1, "Faculty is required"),
  major: z.string().trim().min(1, "Specialization is required"),
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
  whyAttend: shortAnswer("Tell us why you want to attend"),
  projectIdea: shortAnswer(
    "Tell us about something you've built or want to build",
  ),
  skillsGoal: shortAnswer("Tell us what skills you hope to gain"),
});

export type HelloHacksRegistrationValues = z.infer<
  typeof HelloHacksRegistrationSchema
>;
