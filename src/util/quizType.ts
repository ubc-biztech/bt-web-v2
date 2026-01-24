const QUIZ_TYPE_PATTERN = /^[TB][MD][FS][LH]$/i;

const QUIZ_TYPE_LABELS: Record<string, string> = {
  T: "Tech",
  B: "Business",
  M: "Maker",
  D: "Director",
  F: "Founder",
  S: "Scaler",
  L: "Logic",
  H: "Human",
};

const QUIZ_TYPE_DIMENSIONS = [
  "Domain",
  "Mode",
  "Environment",
  "Focus",
] as const;

// MBTI-style archetypes for each Blueprint type
const QUIZ_TYPE_DATA: Record<
  string,
  {
    title: string;
    vibe: string;
    description: string;
    roles: string[];
    superpower: string;
  }
> = {
  // Tech + Maker combinations
  TMFL: {
    title: "The Architect",
    vibe: "Foundation. Elegance. First principles.",
    description:
      "You build the systems that everything else stands on. You thrive in early-stage chaos where you can shape the technical DNA from scratch.",
    roles: [
      "Founding Engineer",
      "Systems Architect",
      "Quant Developer",
      "Security Engineer",
    ],
    superpower: "Turning whiteboard ideas into production reality.",
  },
  TMFH: {
    title: "The Pioneer",
    vibe: "Empathy. Craft. Impact.",
    description:
      "You believe great products start with understanding people. You code with the user's experience in mind, not just the spec.",
    roles: [
      "Product Engineer",
      "UX Engineer",
      "Developer Advocate",
      "Technical Writer",
    ],
    superpower: "Building what users actually need.",
  },
  TMSL: {
    title: "The Engineer",
    vibe: "Optimize. Scale. Automate.",
    description:
      "You're the systematic problem-solver who makes systems faster, cheaper, and more reliable. Inefficiency is your nemesis.",
    roles: [
      "Backend Engineer",
      "Data Engineer",
      "DevOps Engineer",
      "Machine Learning Engineer",
    ],
    superpower: "Making things work at 10x the scale.",
  },
  TMSH: {
    title: "The Mentor",
    vibe: "Code. Coach. Elevate.",
    description:
      "You write great code, but your real output is great engineers. You grow teams while shipping features.",
    roles: [
      "Staff Engineer",
      "Engineering Manager",
      "Technical Trainer",
      "Solutions Architect",
    ],
    superpower: "Multiplying team effectiveness.",
  },

  // Tech + Director combinations
  TDFL: {
    title: "The Strategist",
    vibe: "Vision. Roadmap. Execution.",
    description:
      "You see the technical future and know how to get there. You stop teams from building the wrong thing beautifully.",
    roles: [
      "CTO",
      "Technical Product Manager",
      "Venture Capital (Tech)",
      "R&D Director",
    ],
    superpower: "Aligning technology with business goals.",
  },
  TDFH: {
    title: "The Catalyst",
    vibe: "Culture. Talent. Momentum.",
    description:
      "You build and inspire technical teams. You know that great technology comes from great people working together.",
    roles: [
      "Engineering Director",
      "Head of Developer Relations",
      "Technical Recruiter",
      "Startup Advisor",
    ],
    superpower: "Turning good engineers into great teams.",
  },
  TDSL: {
    title: "The Optimizer",
    vibe: "Performance. Reliability. Excellence.",
    description:
      "You solve scale challenges with elegance. You make systems faster, more reliable, and more cost-effective as they grow.",
    roles: [
      "Principal Engineer",
      "Cloud Architect",
      "Technical Program Manager",
      "Performance Consultant",
    ],
    superpower: "Finding the bottleneck everyone else missed.",
  },
  TDSH: {
    title: "The Commander",
    vibe: "Lead. Scale. Deliver.",
    description:
      "You scale organizations as effectively as systems. You build high-performing teams and create cultures of engineering excellence.",
    roles: [
      "VP of Engineering",
      "CTO",
      "Chief Information Officer",
      "Technical Co-founder",
    ],
    superpower: "Building engineering orgs that ship.",
  },

  // Business + Maker combinations
  BMFL: {
    title: "The Operator",
    vibe: "Hustle. Hack. Ship.",
    description:
      "You make things happen with whatever tools you've got. Spreadsheets, no-code, sheer willpower—whatever it takes.",
    roles: [
      "Growth Engineer",
      "Revenue Operations",
      "Product Analyst",
      "Technical Consultant",
    ],
    superpower: "Getting the first 1,000 users.",
  },
  BMFH: {
    title: "The Evangelist",
    vibe: "Story. Community. Movement.",
    description:
      "You build tribes around ideas. The product matters, but the narrative is what makes people care.",
    roles: [
      "Developer Advocate",
      "Community Manager",
      "Content Marketing",
      "Brand Strategist",
    ],
    superpower: "Turning customers into superfans.",
  },
  BMSL: {
    title: "The Analyst",
    vibe: "Data. Truth. Signal.",
    description:
      "Opinions are nice, spreadsheets are better. You find the insights and opportunities that others miss.",
    roles: [
      "Data Analyst",
      "Business Intelligence",
      "Product Analytics",
      "Management Consultant",
    ],
    superpower: "Predicting the future with data.",
  },
  BMSH: {
    title: "The Partner",
    vibe: "Connect. Trust. Close.",
    description:
      "You don't just meet people—you connect ecosystems. Business is relationships, everything else is details.",
    roles: [
      "Customer Success",
      "Sales Engineer",
      "Partnerships Manager",
      "Account Executive",
    ],
    superpower: "The relationship that closes the deal.",
  },

  // Business + Director combinations
  BDFL: {
    title: "The Founder",
    vibe: "Build. Own. Disrupt.",
    description:
      "You see problems as opportunities. You're driven to create companies that make a dent in the universe.",
    roles: [
      "Startup Founder",
      "Entrepreneur in Residence",
      "Venture Capital",
      "Product Lead",
    ],
    superpower: "Creating something from nothing.",
  },
  BDFH: {
    title: "The Visionary",
    vibe: "Inspire. Rally. Lead.",
    description:
      "You hold the flag. You convince investors, talent, and customers to believe in the impossible.",
    roles: [
      "CEO",
      "Chief Marketing Officer",
      "Head of People",
      "Nonprofit Director",
    ],
    superpower: "The reality distortion field.",
  },
  BDSL: {
    title: "The Executive",
    vibe: "Strategy. Structure. Scale.",
    description:
      "You design how organizations work. You look at the market and decide where the ship turns.",
    roles: [
      "COO",
      "Strategy Consultant",
      "Investment Banking",
      "Corporate Development",
    ],
    superpower: "Seeing the 30,000ft view.",
  },
  BDSH: {
    title: "The Leader",
    vibe: "People. Culture. Results.",
    description:
      "You lead through inspiration, not authority. You build organizations where people thrive and results follow.",
    roles: [
      "General Manager",
      "Chief of Staff",
      "HR Director",
      "Executive Coach",
    ],
    superpower: "Making teams greater than their parts.",
  },
};

export type QuizTypeDisplay = {
  acronym: string;
  title: string;
  vibe: string;
  description: string;
  traits: string[];
  roles: string[];
  superpower: string;
};

export function getQuizTypeDisplay(
  type: string | null | undefined,
): QuizTypeDisplay {
  const normalized = (type ?? "").trim().toUpperCase();
  const isValid = QUIZ_TYPE_PATTERN.test(normalized);
  const traits = normalized
    .split("")
    .map((letter) => QUIZ_TYPE_LABELS[letter] ?? letter);

  const typeData = QUIZ_TYPE_DATA[normalized];

  if (isValid && typeData) {
    return {
      acronym: normalized,
      title: typeData.title,
      vibe: typeData.vibe,
      description: typeData.description,
      traits,
      roles: typeData.roles,
      superpower: typeData.superpower,
    };
  }

  // Fallback for unknown types
  const traitTitle = traits.join(" / ");
  return {
    acronym: normalized,
    title: isValid ? traitTitle : "The Explorer",
    vibe: "Limitless potential.",
    description: isValid
      ? `Your results map to ${traits[0]} (${QUIZ_TYPE_DIMENSIONS[0]}), ${traits[1]} (${QUIZ_TYPE_DIMENSIONS[1]}), ${traits[2]} (${QUIZ_TYPE_DIMENSIONS[2]}), and ${traits[3]} (${QUIZ_TYPE_DIMENSIONS[3]}).`
      : "Your combination is rare and balanced. You adapt to any situation.",
    traits,
    roles: ["Founder", "Generalist", "Strategist"],
    superpower: "Adaptability.",
  };
}
