import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { GetServerSideProps } from "next";
import { fetchBackendFromServer } from "@/lib/db";
import { Member, BiztechEvent } from "@/types";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  CalendarDays,
  MapPin,
  TrendingUp,
  Trophy,
  Sparkles,
  ExternalLink,
  GraduationCap,
  UserCheck,
  Megaphone,
  ChevronRight,
  Clock,
  Star,
  Heart,
  Zap,
  Hash,
  PieChart,
  Award,
  BookOpen,
  Sunrise,
  Sunset,
  Code,
  Palette,
  Handshake,
  Mic,
  Database,
  Home,
  Shield,
  DollarSign,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  UserPlus,
  Mail,
  Target,
  Coffee,
  FileText,
  Send,
  ThumbsUp,
  CreditCard,
  Receipt,
  Building2,
  PartyPopper,
  MessageSquare,
  Terminal,
} from "lucide-react";

type Registration = {
  id: string;
  "eventID;year": string;
  registrationStatus?: string;
  isPartner?: boolean;
  createdAt?: number;
  points?: number;
  scannedQRs?: string;
  basicInformation?: {
    fname?: string;
    lname?: string;
    gender?: string;
    major?: string;
    year?: string;
    diet?: string;
    heardFrom?: string;
    faculty?: string;
    [k: string]: any;
  };
  [k: string]: any;
};

type Props = {
  membersData: Member[] | null;
  eventsData: BiztechEvent[] | null;
  registrationsData: Registration[] | null;
};

type ExecMember = {
  name: string;
  role: string;
  image?: string;
};

type ExecTeam = {
  name: string;
  icon: React.ReactNode;
  color: string;
  members: ExecMember[];
};

const YEAR_START = new Date("2025-09-01T00:00:00");
const YEAR_END = new Date("2026-04-30T23:59:59");
const ACADEMIC_YEAR = "2025\u20132026";

const CHART_COLORS = [
  "#75D450",
  "#A2B1D5",
  "#FF8A9E",
  "#FFC960",
  "#9F8AD1",
  "#75CFF5",
  "#FF9AF8",
  "#8AD1C2",
  "#D1C68A",
  "#EB8273",
  "#7F94FF",
  "#C082D6",
];

const EXEC_TEAMS: ExecTeam[] = [
  {
    name: "Leadership",
    icon: <Shield className="w-4 h-4" />,
    color: "#FFC960",
    members: [
      {
        name: "Grace Co",
        role: "Co-President",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEtoFzn-VCEBg/profile-displayphoto-shrink_800_800/B56ZRo1qrIGsAg-/0/1736925687028?e=1776297600&v=beta&t=fkZDh2dbnnULgcLLkr2ta6QJ9uRlXFOhzOyxGTVnSPE",
      },
      {
        name: "Lucas Gingera",
        role: "Co-President",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEiGCJC6_wQcg/profile-displayphoto-crop_800_800/B56ZfUvem.HQAI-/0/1751620905796?e=1776297600&v=beta&t=R6f3lEjUwxVp_7bSVzu_rwlLuReRD5oNVjDbHMvmIKM",
      },

      {
        name: "Pauline Ongchan",
        role: "Experiences Lead",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGAya3ltQt4AQ/profile-displayphoto-shrink_800_800/B56ZSRrRnVHsAc-/0/1737610828544?e=1776297600&v=beta&t=DvUaW9bWI5JxGea7Bf_AHqM7TOKRObzklIQyGNtqTE4",
      },
      {
        name: "Dhrishty Dhanwani",
        role: "Marketing, Media, Design Lead",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEtgnjiSjXO3A/profile-displayphoto-shrink_800_800/B56ZUwIMuzHsAg-/0/1740269214476?e=1776297600&v=beta&t=_RcIR-20bMwCcC2g93YY2aUh_Kpf2zmRqZBiP98bdyY",
      },
      {
        name: "Kevin Xiao",
        role: "Development Lead",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEE683SF9HjqA/profile-displayphoto-crop_800_800/B56ZyC0Iz5KsAI-/0/1771721233303?e=1776297600&v=beta&t=n1AEDBmTRFQMe_lJFuyM-e-ZJ_p5xcJlLtEIfnj6P-c",
      },
      {
        name: "Lillian Do",
        role: "Treasurer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQH2HI93PmK8QQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1686867009353?e=1776297600&v=beta&t=TikUQG2nzDEDk95JgciQRHbebylyjPAByoQPO06_i7g",
      },

      {
        name: "John Grey",
        role: "Partnerships Lead",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQE6DLbrddsZuA/profile-displayphoto-shrink_800_800/B56ZVE0jNHGUAc-/0/1740616381534?e=1776297600&v=beta&t=7XgzKPw2ukH6vwOWb8W7QhYtGGdO8qnxUZFA2fgtTEs",
      },
    ],
  },
  {
    name: "Experiences",
    icon: <Mic className="w-4 h-4" />,
    color: "#FF8A9E",
    members: [
      {
        name: "Allison Tao",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQHrmdnM1q-Mjw/profile-displayphoto-crop_800_800/B56ZvtBjXkJcAI-/0/1769208167170?e=1776297600&v=beta&t=ug-kosIbLeM3AB4JcGM012360h835FG9g9_bXoi7xos",
      },
      {
        name: "Angela Huang",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQG7xHHH6Ur7CQ/profile-displayphoto-crop_800_800/B56Zvt0QhZHcAI-/0/1769221458426?e=1776297600&v=beta&t=E4VaNXxNkbYxbjcvqOg0ACSiMSM0pAwvyAl2odsTM38",
      },
      {
        name: "Chris Lee",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGIhRr6FY0QSg/profile-displayphoto-crop_800_800/B56Zva6kWpIsAI-/0/1768904345430?e=1776297600&v=beta&t=5527fZvvSUA78WasEfucxLs-6KAua1mVX4wrCxfVpvw",
      },
      {
        name: "Daniel Tong",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D4D03AQEjzdxB-okS1Q/profile-displayphoto-crop_800_800/B4DZwuYCO1KwAI-/0/1770304584000?e=1776297600&v=beta&t=s1ZM9qmhQqWBlEg3QmfStNKdZCeyrVCgIDSOF1bpS9Y",
      },
      {
        name: "Daniel Zhang",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQF4hIlr3iTQCA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1711342035864?e=1776297600&v=beta&t=rm-9wip2logmIq5PWYvHViCEVO1ZIZsV2P1lSzYP_rc",
      },
      {
        name: "Gautham Venkateshwaran",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFN9KQkMqromg/profile-displayphoto-crop_800_800/B56ZwNlN8AHQAI-/0/1769754388674?e=1776297600&v=beta&t=3jmgDJpQ-t86ayzhS_O1YgckDV5tHu_mKBkLlilTKHw",
      },
      {
        name: "Jack Shaw",
        role: "Director",
        image:
          "https://framerusercontent.com/images/Bub0DlMy8bY6VYTR9byyDL4cvwo.png?width=304&height=304",
      },
    ],
  },
  {
    name: "Partnerships",
    icon: <Handshake className="w-4 h-4" />,
    color: "#75CFF5",
    members: [
      {
        name: "Angela Felicia",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFBymVKdJH3GQ/profile-displayphoto-crop_800_800/B56ZebwJ.1HQAI-/0/1750664782498?e=1776297600&v=beta&t=1GK22R6dpvPjjQNwenyfYVldrALkUEfbZI28Lo4EPec",
      },
      {
        name: "Darius Alexander",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGq16MaT4Hs0A/profile-displayphoto-crop_800_800/B56Zvetvk5IcAI-/0/1768968092300?e=1776297600&v=beta&t=B9RyAw6HQ3M3JkV5ZwMN3333jNVRbgCKUSRPzahnNcg",
      },
      {
        name: "Jimmy Sam",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQHBaHYATM7tcQ/profile-displayphoto-shrink_800_800/B56ZU7Z8B1GUAc-/0/1740458410376?e=1776297600&v=beta&t=HsYS1gT-4eO5_Y63MpY0kcq13JrxYlLuMf09Utk8rl0",
      },
      {
        name: "Karen Siem",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D4E03AQFrLSYefZCu-Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1728854871272?e=1776297600&v=beta&t=hFtUY1QvfwX8PbnfsfJhungO9iPM7xAqMJ-Iu9BEQdY",
      },
      {
        name: "Keon Lee",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEKLTB0JD4NIQ/profile-displayphoto-crop_800_800/B56ZoylkQ0JkAI-/0/1761785300570?e=1776297600&v=beta&t=r6qropG5Suq6tNMGqAzeS3FLkRRnep_Gb7Qswr3mcTE",
      },
      {
        name: "Rohan Patel",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEbe9C6cIQqwQ/profile-displayphoto-crop_800_800/B56Z03WlzCKcAM-/0/1774750164429?e=1776297600&v=beta&t=l5AvgGbIkdnUTNVAM3dtHYb48NKPbh0pIH-8V2CXn7A",
      },
    ],
  },
  {
    name: "Marketing, Media, Design",
    icon: <Palette className="w-4 h-4" />,
    color: "#FF9AF8",
    members: [
      {
        name: "Emily Lu",
        role: "Marketing Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGHlfLN2bWIBg/profile-displayphoto-crop_800_800/B56ZycpGcDGwAI-/0/1772154546493?e=1776297600&v=beta&t=RPPigwIVE9YxytaA6dXrWb87jAQKH3uOxq_mSci3z-0",
      },
      {
        name: "Emma Lin",
        role: "Marketing Director",
        image:
          "https://framerusercontent.com/images/V8lk18qvPSz4ofQazfRjocLQFic.png?width=800&height=800",
      },
      {
        name: "Ali Hosseini",
        role: "Media Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGHtA70Hm7Hag/profile-displayphoto-crop_800_800/B56Zpk03XPG4AI-/0/1762628176406?e=1776297600&v=beta&t=Kevp6LP1EbH_uszHg8xuDfAthgYEwr_6Bx4Z4PTAfzQ",
      },
      {
        name: "Keira Lee",
        role: "Media Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEd8IpTJBAeQQ/profile-displayphoto-crop_800_800/B56Zu5XKKfHkAM-/0/1768341416598?e=1776297600&v=beta&t=UczCi9c4nb2JbNczD8aiiiIE0S4H6vM99IV_RwH3KUM",
      },
      {
        name: "Stephanie Lee",
        role: "Media Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGJdSuA96I0LA/profile-displayphoto-crop_800_800/B56ZqTt0ogI4AI-/0/1763414859203?e=1776297600&v=beta&t=yvYppS0QmJikrQUP8zOKSIKt8aBqN6x7FZlCU_mNiho",
      },
      {
        name: "Yumin Chang",
        role: "Media Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFbf3far-6S4A/profile-displayphoto-crop_800_800/B56ZlWfnFmKMAI-/0/1758092751750?e=1776297600&v=beta&t=-MDlNEtfRtIaXQ9VGqXUxc0oz9hhef1co4-4MlyCLcI",
      },
      {
        name: "Chelsea Choa",
        role: "Design Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGhSiWyqy65sg/profile-displayphoto-shrink_800_800/B56Zoh7BtpKEAc-/0/1761505713550?e=1776297600&v=beta&t=Iv5fWJ4iNHrNX0FQ4fO-7DIWzOq-RCslu-KG741UA4I",
      },
      {
        name: "Indira Sowy",
        role: "Design Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGtGW6vNcKA7A/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1730758686379?e=1776297600&v=beta&t=dHU3wDT75CQb1ZEiTpt2pPzfoHrw6lgt1T2VhbY8vRw",
      },
      {
        name: "Julianna Huang",
        role: "Design Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFMHctuhQ1HiQ/profile-displayphoto-crop_800_800/B56Zv74USRHsAI-/0/1769457403349?e=1776297600&v=beta&t=22zwLGknF_oCRmZzvoJdfZk1Iu5BScv0mEjN60MtGNY",
      },
    ],
  },
  {
    name: "Development",
    icon: <Code className="w-4 h-4" />,
    color: "#75D450",
    members: [
      {
        name: "Jay Park",
        role: "Product Manager",
        image:
          "https://media.licdn.com/dms/image/v2/D4D03AQEeM1yBS3ZRUw/profile-displayphoto-crop_800_800/B4DZtTJmvMIkAI-/0/1766626586074?e=1776297600&v=beta&t=sohRI0ofvUG2r2ghURi6kW1mVrcf8SSP897fjX6cHxI",
      },
      {
        name: "Ethan Hansen",
        role: "Senior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFV5OZI1js00g/profile-displayphoto-crop_800_800/B56ZxkxxfGJAAM-/0/1771217295882?e=1776297600&v=beta&t=r5ILyFtX9MD8j3kut6Nhl17jL9ucr5madWa_g2Lw6Hg",
      },
      {
        name: "Benny Chinvanich",
        role: "Senior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFviDjG26DlRQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1689219655444?e=1776297600&v=beta&t=-Gf7fspF8sYSEG3ZXHMmVDuQj2GfShzRd7Q9Y9P9mNM",
      },
      {
        name: "Brian Adhitya",
        role: "Senior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D4D03AQH_PDagcIYekg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715583432548?e=1776297600&v=beta&t=QlmC9LvrT95zGLPtdJf1j5XefByQQlBRwqyOnxADwWA",
      },
      {
        name: "Janaye Cheong",
        role: "Senior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGJicMA0N1tsA/profile-displayphoto-shrink_800_800/B56ZZUFmbCGsAc-/0/1745167477340?e=1776297600&v=beta&t=frqHMUIPceg0OyD-OtlP1nIT2ASdxibBKRkFNVOzl_k",
      },
      {
        name: "Alex Gour",
        role: "Junior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGEiWoILDW6wg/profile-displayphoto-crop_800_800/B56Zrn2lSGLoAI-/0/1764826438779?e=1776297600&v=beta&t=wEMZhUy7xmWjOSb8_Vdv3_GZh9lTHzjCrd4rYUdi9fg",
      },
      {
        name: "Aurora Cheng",
        role: "Junior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEul4wnmYtaHQ/profile-displayphoto-crop_800_800/B56Zqoc.3HHkAI-/0/1763762768655?e=1776297600&v=beta&t=0mXWzoiRltQKDo-uNyqzB4uiqJfd2spw5mz8f-xAzbM",
      },
      {
        name: "Elijah Zhao",
        role: "Junior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQG1GeETvpm7SQ/profile-displayphoto-crop_800_800/B56Z04sdbRGsAI-/0/1774772676576?e=1776297600&v=beta&t=2AF_KX7jcz0BxZve1d4BVmxfrWJ9ogWoagsyciAIDHY",
      },
      {
        name: "Isaac Liu",
        role: "Junior Developer",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFV5qdFGMHt4Q/profile-displayphoto-crop_800_800/B56Z0fPc70H8AM-/0/1774345638977?e=1776297600&v=beta&t=qLbOep2wGvnRPTnS-jdarx0W_tuLf6V3pAAij3wcRGQ",
      },
    ],
  },
  {
    name: "Data",
    icon: <Database className="w-4 h-4" />,
    color: "#8AD1C2",
    members: [
      {
        name: "Elena Guo",
        role: "Data Director",
        image:
          "https://media.licdn.com/dms/image/v2/D4E03AQHDAAOcg-s01Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1690315326160?e=1776297600&v=beta&t=QPUCuoHf4JkFuwqJK9yp48upeb5iTK4ktdeP0M-Ts5k",
      },
    ],
  },
  {
    name: "Internal",
    icon: <Home className="w-4 h-4" />,
    color: "#D1C68A",
    members: [
      {
        name: "Ashley Low",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQFBZVeAs8__FQ/profile-displayphoto-shrink_800_800/B56ZUhjPavHoAc-/0/1740024646904?e=1776297600&v=beta&t=IG__yNgUsv_NDN9IPQU9fSYvFEXX20nsDBKFYKb-oPc",
      },
      {
        name: "Erping Sun",
        role: "Director",
        image:
          "https://media.licdn.com/dms/image/v2/D4D03AQH2ubAm9KdP3g/profile-displayphoto-crop_800_800/B4DZyWTFbqGQAI-/0/1772048117393?e=1776297600&v=beta&t=2UrGMSwh0DuS5FVcJPG9gpJrz0TNzqHp8lEzMcl-FNA",
      },
      {
        name: "Jerimy Crisologo",
        role: "Athletics Director",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGMQq3uAUbC4Q/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1715188594962?e=1776297600&v=beta&t=aos9xn1A7HkbfGsA5GpgJZyLFFd_KfWvIVt4H_x_-JY",
      },
      {
        name: "Jade Tao",
        role: "First-year Representative",
        image:
          "https://media.licdn.com/dms/image/v2/D4E03AQEf7ep_EAcdRg/profile-displayphoto-shrink_800_800/B4EZc.VWf.HgAg-/0/1749097474421?e=1776297600&v=beta&t=dDAWpBHyHXJe-bw2NpRrNR1KJ3vZjzld9beA08Ppl9Q",
      },
      {
        name: "Michele Cavezza",
        role: "First-year Rep",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQGA3Xo2TYHjKA/profile-displayphoto-shrink_800_800/B56ZQ14GjHHoAc-/0/1736070687182?e=1776297600&v=beta&t=YEEi9eYxY8WIV9d8PkqHyffYNvvw64j4StGXl02L9Jc",
      },
      {
        name: "Sophia Huang",
        role: "First-year Rep",
        image:
          "https://media.licdn.com/dms/image/v2/D4D03AQGWbCZW6uVFGQ/profile-displayphoto-crop_800_800/B4DZl5gHglGwAI-/0/1758680087565?e=1776297600&v=beta&t=VCRlagndbb5HPJQTr2ezg7oPWCoMsnP8mVbPwYkYK7w",
      },
    ],
  },
  {
    name: "Advisors",
    icon: <Star className="w-4 h-4" />,
    color: "#EB8273",
    members: [
      {
        name: "Allan Tan",
        role: "Advisor",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQH7XOWWW3iccQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1682995847041?e=1776297600&v=beta&t=zMcwL5I1nG_EtA99BPNXQWwgspPyHGXpgb3nL9TAens",
      },
      {
        name: "Eliana Barbosa",
        role: "Advisor",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQEK0-n2DwKy8A/profile-displayphoto-crop_800_800/B56ZpxWQguJ4AI-/0/1762838252206?e=1776297600&v=beta&t=ukUO9bfqsz4KtwrL4geqlsgAh2ZEbkj2cFqmK1qRqPo",
      },
      {
        name: "Mikayla Liang",
        role: "Advisor",
        image:
          "https://media.licdn.com/dms/image/v2/D5603AQG4WVKJyTrgFQ/profile-displayphoto-crop_800_800/B56ZtyX2iCJgAQ-/0/1767150414713?e=1776297600&v=beta&t=OCh1swMV4q1TxEq5ScDdD-eBA0IeZlH6xxn_N8yR4k8",
      },
    ],
  },
];

const TOTAL_EXEC = EXEC_TEAMS.reduce((s, t) => s + t.members.length, 0);

function inAcademicYear(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= YEAR_START && d <= YEAR_END;
}

function tsInYear(ts: number | undefined): boolean {
  if (!ts) return false;
  const ms = ts > 1e12 ? ts : ts * 1000;
  const d = new Date(ms);
  return d >= YEAR_START && d <= YEAR_END;
}

function tsToDate(ts: number): Date {
  return new Date(ts > 1e12 ? ts : ts * 1000);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function dayOfWeek(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

function Counter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
}: {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(
        decimals > 0
          ? parseFloat((eased * end).toFixed(decimals))
          : Math.round(eased * end),
      );
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration, decimals]);

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ScaleIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useFadeIn(0.2);
  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionDivider({ quote, author }: { quote: string; author?: string }) {
  return (
    <section className="relative py-24 md:py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bt-blue-300/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-bt-blue-300/20 to-transparent" />
      </div>
      <FadeIn>
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-5 h-5 text-bt-blue-300/30 mx-auto mb-6" />
          <p className="text-xl md:text-2xl lg:text-3xl font-light italic text-bt-blue-100 leading-relaxed font-instrument">
            &ldquo;{quote}&rdquo;
          </p>
          {author && (
            <p className="mt-5 text-sm text-bt-blue-300">&mdash; {author}</p>
          )}
        </div>
      </FadeIn>
    </section>
  );
}

function Marquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-6 md:py-8 border-y border-bt-blue-300/10">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-4 md:mx-6 text-sm md:text-md font-medium text-bt-blue-300/40 hover:text-bt-green-300/70 transition-colors duration-300"
          >
            {item}
            <span className="ml-4 md:ml-6 text-bt-blue-300/15">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function YearProgress() {
  const now = new Date();
  const total = YEAR_END.getTime() - YEAR_START.getTime();
  const elapsed = Math.min(
    Math.max(now.getTime() - YEAR_START.getTime(), 0),
    total,
  );
  const pct = Math.round((elapsed / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2 text-xs text-bt-blue-200">
        <span>Sep 2025</span>
        <span className="text-bt-green-300 font-medium font-redhat">
          {pct}% through the year
        </span>
        <span>Apr 2026</span>
      </div>
      <div className="h-1.5 rounded-full bg-bt-blue-500/40 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-bt-green-400 to-bt-green-300 transition-all duration-1000 ease-out relative"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-bt-green-300 shadow-[0_0_12px_rgba(117,212,80,0.6)]" />
        </div>
      </div>
    </div>
  );
}

function MiniDonut({
  segments,
  size = 120,
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  let cumulative = 0;
  const gradientStops = segments.flatMap((seg) => {
    const start = (cumulative / total) * 360;
    cumulative += seg.value;
    const end = (cumulative / total) * 360;
    return [`${seg.color} ${start}deg ${end}deg`];
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="rounded-full transition-transform duration-500 hover:scale-110"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${gradientStops.join(", ")})`,
          mask: `radial-gradient(circle at center, transparent ${size * 0.35}px, black ${size * 0.35 + 1}px)`,
          WebkitMask: `radial-gradient(circle at center, transparent ${size * 0.35}px, black ${size * 0.35 + 1}px)`,
        }}
      />
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {segments
          .filter((s) => s.value > 0)
          .slice(0, 6)
          .map((seg) => (
            <div key={seg.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[10px] text-bt-blue-200">
                {seg.label} ({Math.round((seg.value / total) * 100)}%)
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function GlowCard({
  children,
  className = "",
  glowColor = "rgba(117,212,80,0.15)",
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl border border-bt-blue-300/15 bg-bt-blue-600/40 overflow-hidden transition-all duration-300 hover:border-bt-blue-300/30 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function TiltCard({
  children,
  className = "",
  color = "#75D450",
  intensity = 12,
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateX = (y - 0.5) * -intensity;
      const rotateY = (x - 0.5) * intensity;
      setTransform(
        `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04,1.04,1.04)`,
      );
      setSpotlight({ x: x * 100, y: y * 100, opacity: 1 });
    },
    [intensity],
  );

  const handleMouseLeave = useCallback(() => {
    setTransform(
      "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)",
    );
    setSpotlight((s) => ({ ...s, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative will-change-transform ${className}`}
      style={{
        transform,
        transition: "transform 0.4s cubic-bezier(0.03,0.98,0.52,0.99)",
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl z-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, ${color}20, transparent 60%)`,
          opacity: spotlight.opacity,
        }}
      />
      {children}
    </div>
  );
}

function Particle() {
  const style = useMemo(() => {
    const size = Math.random() * 3 + 1;
    const colors = [
      "#75D450",
      "#75CFF5",
      "#FFC960",
      "#FF8A9E",
      "#9F8AD1",
      "#FF9AF8",
    ];
    return {
      width: size,
      height: size,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.1,
      animationDuration: `${Math.random() * 8 + 6}s`,
      animationDelay: `${Math.random() * 5}s`,
    };
  }, []);

  return (
    <div
      className="absolute rounded-full animate-particle pointer-events-none"
      style={style}
    />
  );
}

function ParticleField({ count = 30 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} />
      ))}
    </div>
  );
}

function TypeWriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.5 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <span ref={ref}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-blink text-bt-green-300">|</span>
      )}
    </span>
  );
}

function NumberTicker({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const digits = value.toString().split("");
  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      {digits.map((d, i) => (
        <span
          key={i}
          className="inline-block animate-number-roll"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {d}
        </span>
      ))}
    </span>
  );
}

export default function YearInReview({
  membersData,
  eventsData,
  registrationsData,
}: Props) {
  const members = useMemo(() => membersData ?? [], [membersData]);
  const events = useMemo(() => eventsData ?? [], [eventsData]);
  const registrations = useMemo(
    () => registrationsData ?? [],
    [registrationsData],
  );

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const yearEvents = useMemo(
    () =>
      events
        .filter(
          (e) =>
            inAcademicYear(e.startDate) &&
            e.isPublished &&
            !e.ename?.toLowerCase().includes("public showcase"),
        )
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        ),
    [events],
  );

  const yearRegistrations = useMemo(() => {
    const eventKeys = new Set(yearEvents.map((e) => `${e.id};${e.year}`));
    return registrations.filter(
      (r) => eventKeys.has(r["eventID;year"]) && !r.isPartner,
    );
  }, [yearEvents, registrations]);

  const yearMembers = useMemo(
    () => members.filter((m) => tsInYear(m.createdAt)),
    [members],
  );

  const totalEvents = yearEvents.length;
  const totalRegistrations = yearRegistrations.length;
  const totalNewMembers = yearMembers.length;
  const uniqueAttendees = useMemo(
    () => new Set(yearRegistrations.map((r) => r.id)).size,
    [yearRegistrations],
  );
  const totalCheckedIn = useMemo(
    () =>
      yearRegistrations.filter((r) => r.registrationStatus === "checkedIn")
        .length,
    [yearRegistrations],
  );
  const avgAttendance = useMemo(
    () =>
      totalRegistrations > 0
        ? Math.round((totalCheckedIn / totalRegistrations) * 100)
        : 0,
    [totalCheckedIn, totalRegistrations],
  );

  const normalizeVenue = useCallback((raw: string): string => {
    const s = raw.trim().toLowerCase();
    // Sauder / Henry Angus variants
    if (
      s.includes("sauder") ||
      s.includes("henry angus") ||
      s.includes("big 4 conference")
    )
      return "UBC Sauder (Henry Angus)";
    // AMS Nest variants
    if (s.includes("nest") || s.includes("ams")) return "AMS Nest";
    // Robson Square
    if (s.includes("robson square")) return "UBC Robson Square";
    // Graduate Student Center
    if (s.includes("graduate student")) return "Graduate Student Center";
    return raw.trim();
  }, []);

  const uniqueVenues = useMemo(() => {
    const locs = new Set(
      yearEvents
        .map((e) => e.elocation?.trim())
        .filter(Boolean)
        .map((loc) => normalizeVenue(loc!)),
    );
    return locs.size;
  }, [yearEvents, normalizeVenue]);

  const venueList = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of yearEvents) {
      const loc = e.elocation?.trim();
      if (loc) {
        const normalized = normalizeVenue(loc);
        map[normalized] = (map[normalized] || 0) + 1;
      }
    }
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [yearEvents, normalizeVenue]);

  const eventRegCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of yearRegistrations) {
      map[r["eventID;year"]] = (map[r["eventID;year"]] || 0) + 1;
    }
    return map;
  }, [yearRegistrations]);

  const largestEvent = useMemo(() => {
    if (!yearEvents.length) return null;
    let best = yearEvents[0];
    let bestCount = 0;
    for (const e of yearEvents) {
      const count = eventRegCounts[`${e.id};${e.year}`] || 0;
      if (count > bestCount) {
        bestCount = count;
        best = e;
      }
    }
    return { event: best, count: bestCount };
  }, [yearEvents, eventRegCounts]);

  const firstEvent = yearEvents.length > 0 ? yearEvents[0] : null;
  const lastEvent =
    yearEvents.length > 0 ? yearEvents[yearEvents.length - 1] : null;

  const eventTimeline = useMemo(() => {
    return yearEvents.map((e) => {
      const key = `${e.id};${e.year}`;
      const regs = yearRegistrations.filter((r) => r["eventID;year"] === key);
      const checkedIn = regs.filter(
        (r) => r.registrationStatus === "checkedIn",
      ).length;
      return {
        ...e,
        regCount: regs.length,
        checkedIn,
        fillRate: e.capac > 0 ? Math.round((regs.length / e.capac) * 100) : 0,
      };
    });
  }, [yearEvents, yearRegistrations]);

  const hourCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const r of yearRegistrations) {
      if (!r.createdAt) continue;
      const h = tsToDate(r.createdAt).getHours();
      counts[h] = (counts[h] || 0) + 1;
    }
    return counts;
  }, [yearRegistrations]);
  const peakRegHour = useMemo(() => {
    let bestH = 12;
    let bestC = 0;
    for (const [h, c] of Object.entries(hourCounts)) {
      if (c > bestC) {
        bestH = Number(h);
        bestC = c;
      }
    }
    const ampm = bestH >= 12 ? "pm" : "am";
    const h12 = bestH === 0 ? 12 : bestH > 12 ? bestH - 12 : bestH;
    return { hour: bestH, label: `${h12}${ampm}`, count: bestC };
  }, [hourCounts]);

  const attendeeTiers = useMemo(() => {
    const emailCounts: Record<string, number> = {};
    for (const r of yearRegistrations)
      emailCounts[r.id] = (emailCounts[r.id] || 0) + 1;
    const vals = Object.values(emailCounts);
    return {
      once: vals.filter((c) => c === 1).length,
      twice: vals.filter((c) => c === 2).length,
      threeToFour: vals.filter((c) => c >= 3 && c <= 4).length,
      fivePlus: vals.filter((c) => c >= 5).length,
      total: vals.length,
      maxEvents: Math.max(...vals, 0),
    };
  }, [yearRegistrations]);

  const superFans = attendeeTiers.threeToFour + attendeeTiers.fivePlus;

  const facultyBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const faculty = r.basicInformation?.faculty;
      if (!faculty?.trim()) continue;
      counts[faculty.trim()] = (counts[faculty.trim()] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const genderBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const g = r.basicInformation?.gender?.trim();
      if (!g) continue;
      counts[g] = (counts[g] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const yearLevelBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const y = r.basicInformation?.year?.trim();
      if (!y) continue;
      counts[y] = (counts[y] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const topMajors = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const m = r.basicInformation?.major?.trim();
      if (!m) continue;
      counts[m] = (counts[m] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const dietBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const d = r.basicInformation?.diet?.trim();
      if (!d) continue;
      counts[d] = (counts[d] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const heardFromBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of yearRegistrations) {
      const h = r.basicInformation?.heardFrom?.trim();
      if (!h) continue;
      counts[h] = (counts[h] || 0) + 1;
    }
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [yearRegistrations]);

  const avgFillRate = useMemo(() => {
    const withCapac = yearEvents.filter((e) => e.capac > 0);
    if (withCapac.length === 0) return 0;
    const totalRate = withCapac.reduce((sum, e) => {
      const regs = eventRegCounts[`${e.id};${e.year}`] || 0;
      return sum + Math.min(regs / e.capac, 1);
    }, 0);
    return Math.round((totalRate / withCapac.length) * 100);
  }, [yearEvents, eventRegCounts]);

  const avgRegsPerEvent = useMemo(
    () =>
      totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(1) : "0",
    [totalEvents, totalRegistrations],
  );

  const longestStreak = useMemo(() => {
    if (yearEvents.length === 0) return 0;
    const weeks = new Set(
      yearEvents.map((e) => {
        const diff = new Date(e.startDate).getTime() - YEAR_START.getTime();
        return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
      }),
    );
    const sorted = Array.from(weeks).sort((a, b) => a - b);
    let maxStreak = 1;
    let current = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] === 1) {
        current++;
        maxStreak = Math.max(maxStreak, current);
      } else {
        current = 1;
      }
    }
    return maxStreak;
  }, [yearEvents]);

  const avgEventDuration = useMemo(() => {
    const durations = yearEvents
      .filter((e) => e.startDate && e.endDate)
      .map((e) => {
        const start = new Date(e.startDate).getTime();
        const end = new Date(e.endDate).getTime();
        return (end - start) / (1000 * 60 * 60);
      })
      .filter((h) => h > 0 && h < 48);
    if (durations.length === 0) return 0;
    return parseFloat(
      (durations.reduce((s, d) => s + d, 0) / durations.length).toFixed(1),
    );
  }, [yearEvents]);

  const totalEventHours = useMemo(() => {
    return yearEvents
      .filter((e) => e.startDate && e.endDate)
      .reduce((sum, e) => {
        const start = new Date(e.startDate).getTime();
        const end = new Date(e.endDate).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        return hours > 0 && hours < 48 ? sum + hours : sum;
      }, 0);
  }, [yearEvents]);

  const avgLeadTimeDays = useMemo(() => {
    const diffs: number[] = [];
    for (const r of yearRegistrations) {
      if (!r.createdAt) continue;
      const evKey = r["eventID;year"];
      const ev = yearEvents.find((e) => `${e.id};${e.year}` === evKey);
      if (!ev) continue;
      const regDate = tsToDate(r.createdAt).getTime();
      const evDate = new Date(ev.startDate).getTime();
      const daysDiff = (evDate - regDate) / (1000 * 60 * 60 * 24);
      if (daysDiff >= 0 && daysDiff < 120) diffs.push(daysDiff);
    }
    if (diffs.length === 0) return 0;
    return parseFloat(
      (diffs.reduce((s, d) => s + d, 0) / diffs.length).toFixed(1),
    );
  }, [yearRegistrations, yearEvents]);

  const favouriteDay = useMemo(() => {
    const dayCounts: Record<string, number> = {};
    for (const e of yearEvents) {
      const day = new Date(e.startDate).toLocaleDateString("en-US", {
        weekday: "long",
      });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    let bestDay = "";
    let bestCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > bestCount) {
        bestDay = day;
        bestCount = count;
      }
    }
    return { day: bestDay, count: bestCount };
  }, [yearEvents]);

  const eventNames = useMemo(
    () => yearEvents.map((e) => e.ename),
    [yearEvents],
  );
  const waitlistedCount = useMemo(
    () =>
      yearRegistrations.filter((r) => r.registrationStatus === "waitlist")
        .length,
    [yearRegistrations],
  );

  return (
    <>
      <Head>
        <title>Year in Review {ACADEMIC_YEAR} | UBC BizTech</title>
        <meta
          name="description"
          content={`UBC BizTech ${ACADEMIC_YEAR} Year in Review \u2014 ${totalEvents} events, ${totalNewMembers} new members, and counting.`}
        />
      </Head>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes nameGradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delay {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(3deg);
          }
        }
        @keyframes glow-pulse {
          0%,
          100% {
            opacity: 0.4;
            box-shadow: 0 0 8px rgba(117, 212, 80, 0.3);
          }
          50% {
            opacity: 0.9;
            box-shadow: 0 0 20px rgba(117, 212, 80, 0.5);
          }
        }
        @keyframes particle {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120px) translateX(40px) scale(0);
            opacity: 0;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        @keyframes number-roll {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes orbit {
          0% {
            transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(var(--orbit-radius))
              rotate(-360deg);
          }
        }
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes slide-up {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 6s ease-in-out infinite 2s;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite 1s;
        }
        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }
        .animate-particle {
          animation: particle 8s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
          background-size: 200% 100%;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-number-roll {
          animation: number-roll 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-orbit {
          animation: orbit var(--orbit-duration) linear infinite;
        }
        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
          background-size: 300% 300%;
        }
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .glass-card {
          background: linear-gradient(
            135deg,
            rgba(13, 23, 44, 0.6) 0%,
            rgba(11, 17, 30, 0.8) 100%
          );
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .text-gradient-green {
          background: linear-gradient(135deg, #75d450, #70e442, #75cff5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .border-glow-green {
          box-shadow:
            0 0 0 1px rgba(117, 212, 80, 0.1),
            0 0 20px rgba(117, 212, 80, 0.05);
        }

        @keyframes border-rotate {
          0% {
            --border-angle: 0deg;
          }
          100% {
            --border-angle: 360deg;
          }
        }
        @keyframes stagger-in {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes ring-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes card-shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
        @keyframes tilt-shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }
        @keyframes text-reveal {
          0% {
            clip-path: inset(0 100% 0 0);
          }
          100% {
            clip-path: inset(0 0% 0 0);
          }
        }
        @keyframes name-glow {
          0%,
          100% {
            text-shadow: 0 0 8px var(--glow-color, rgba(117, 212, 80, 0));
          }
          50% {
            text-shadow:
              0 0 20px var(--glow-color, rgba(117, 212, 80, 0.3)),
              0 0 40px var(--glow-color, rgba(117, 212, 80, 0.1));
          }
        }
        @keyframes spotlight {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        @keyframes entrance-pop {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.85) rotateX(10deg);
          }
          60% {
            transform: translateY(-4px) scale(1.02) rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        @keyframes avatar-breathe {
          0%,
          100% {
            box-shadow: 0 0 0 0 var(--ring-color, rgba(117, 212, 80, 0.3));
          }
          50% {
            box-shadow: 0 0 0 6px var(--ring-color, rgba(117, 212, 80, 0));
          }
        }
        @keyframes subtle-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .animate-stagger-in {
          animation: stagger-in 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-ring-spin {
          animation: ring-spin 8s linear infinite;
        }
        .animate-breathe {
          animation: breathe 4s ease-in-out infinite;
        }
        .animate-entrance-pop {
          animation: entrance-pop 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-subtle-float {
          animation: subtle-float 6s ease-in-out infinite;
        }
        .exec-card {
          transition: box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .exec-card:hover {
          box-shadow:
            0 30px 60px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.06);
        }
        .exec-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.5s;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.04),
            transparent 60%
          );
        }
        .exec-card:hover::before {
          opacity: 1;
        }
        .exec-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.05),
            transparent
          );
          transition: none;
        }
        .exec-card:hover::after {
          animation: card-shimmer 0.8s ease-out;
        }
        .leadership-card {
          position: relative;
          overflow: hidden;
        }
        .leadership-card::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 2px;
          background: conic-gradient(
            from var(--border-angle, 0deg),
            transparent 30%,
            var(--card-color) 50%,
            transparent 70%
          );
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: border-rotate 4s linear infinite;
          opacity: 0;
          transition: opacity 0.5s;
        }
        .leadership-card:hover::before {
          opacity: 1;
        }
        .leadership-card:hover .avatar-ring {
          animation: ring-spin 4s linear infinite;
        }
        .leadership-card:hover .member-name {
          animation: name-glow 2s ease-in-out infinite;
        }
        .exec-card:hover .member-name {
          animation: name-glow 2s ease-in-out infinite;
        }
        .exec-card:hover .avatar-container {
          animation: avatar-breathe 2s ease-in-out infinite;
        }
        .team-section-divider {
          position: relative;
        }
        .team-section-divider::before {
          content: "";
          position: absolute;
          left: 24px;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(
            to bottom,
            var(--team-color) 0%,
            transparent 100%
          );
          opacity: 0.2;
        }
        /* Team grid: dim siblings on hover */
        .team-card-grid:hover .tilt-card-wrapper {
          opacity: 0.55;
          filter: brightness(0.7);
          transition:
            opacity 0.4s,
            filter 0.4s,
            transform 0.4s;
        }
        .team-card-grid:hover .tilt-card-wrapper:hover {
          opacity: 1;
          filter: brightness(1);
        }
        .tilt-card-wrapper {
          transition:
            opacity 0.4s,
            filter 0.4s,
            transform 0.4s;
        }
        /* Hero sparkle particles */
        @keyframes sparkle-float {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--sx), var(--sy)) scale(0);
            opacity: 0;
          }
        }
        .hero-card-wrap {
          position: relative;
        }
        .hero-card-wrap .sparkle-container {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 30;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .hero-card-wrap:hover .sparkle-container {
          opacity: 1;
        }
        .sparkle-dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: sparkle-float 1.2s ease-out infinite;
        }
        /* Orbiting dots around avatar on hover */
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg);
          }
        }
        .avatar-orbit-ring {
          position: absolute;
          inset: -12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s;
        }
        .group:hover .avatar-orbit-ring {
          opacity: 1;
        }
        .orbit-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 4px;
          height: 4px;
          margin: -2px;
          border-radius: 50%;
          animation: orbit var(--orbit-speed) linear infinite;
        }
        /* Gradient border pulse for team header icons */
        @keyframes icon-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 var(--team-color);
          }
          50% {
            box-shadow: 0 0 12px 2px var(--team-color);
          }
        }
        .team-icon-box:hover {
          animation: icon-pulse 1.5s ease-in-out infinite;
        }
        /* Footer orbiting ring */
        @keyframes footer-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .footer-orbit-ring {
          animation: footer-orbit 30s linear infinite;
        }
        /* Reveal slide-up for team names */
        @keyframes team-name-reveal {
          0% {
            transform: translateY(100%);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .team-name-reveal {
          animation: team-name-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      <div className="min-h-screen bg-bt-blue-700 text-white overflow-x-hidden">
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          <ParticleField count={40} />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute -top-1/4 -left-1/4 w-[700px] h-[700px] rounded-full bg-bt-green-400/8 blur-[140px]"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            />
            <div
              className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-[#75CFF5]/6 blur-[120px]"
              style={{ transform: `translateY(${-scrollY * 0.05}px)` }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#9F8AD1]/5 blur-[100px]"
              style={{ transform: `translateY(${scrollY * 0.08}px)` }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-bt-green-300/3 blur-[160px]" />
          </div>

          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              {
                top: "15%",
                left: "8%",
                size: "w-3 h-3",
                color: "bg-bt-green-300/30",
                anim: "animate-float",
              },
              {
                top: "25%",
                left: "85%",
                size: "w-2 h-2",
                color: "bg-[#75CFF5]/30",
                anim: "animate-float-delay",
              },
              {
                top: "60%",
                left: "18%",
                size: "w-4 h-4",
                color: "bg-[#FFC960]/15",
                anim: "animate-float-slow",
              },
              {
                top: "70%",
                left: "78%",
                size: "w-2 h-2",
                color: "bg-[#FF8A9E]/20",
                anim: "animate-float",
              },
              {
                top: "40%",
                left: "72%",
                size: "w-3 h-3",
                color: "bg-[#9F8AD1]/20",
                anim: "animate-float-delay",
              },
              {
                top: "85%",
                left: "45%",
                size: "w-2 h-2",
                color: "bg-bt-green-400/20",
                anim: "animate-float-slow",
              },
              {
                top: "10%",
                left: "50%",
                size: "w-1.5 h-1.5",
                color: "bg-[#FF9AF8]/25",
                anim: "animate-float",
              },
              {
                top: "55%",
                left: "92%",
                size: "w-2.5 h-2.5",
                color: "bg-[#8AD1C2]/20",
                anim: "animate-float-delay",
              },
            ].map((dot, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${dot.size} ${dot.color} ${dot.anim}`}
                style={{ top: dot.top, left: dot.left }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <FadeIn>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="relative">
                  <Image
                    src="/assets/biztech_logo.svg"
                    alt="BizTech Logo"
                    width={52}
                    height={52}
                    className="w-11 h-11 md:w-13 md:h-13"
                  />
                  <div className="absolute inset-0 rounded-full animate-pulse-ring border border-bt-green-300/20" />
                </div>
                <span className="text-sm md:text-md font-medium text-bt-blue-100 tracking-[0.2em] uppercase">
                  UBC BizTech
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <h1 className="text-5xl sm:text-[68px] md:text-[100px] font-bold leading-[1.02] tracking-tight mb-6">
                <span className="block text-white">Year in Review</span>
                <span
                  className="block bg-gradient-to-r from-bt-green-300 via-[#75CFF5] to-bt-green-400 bg-clip-text text-transparent animate-gradient-shift"
                  style={{ backgroundSize: "300% 100%" }}
                >
                  {ACADEMIC_YEAR}
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={400}>
              <p className="text-sm md:text-lg text-bt-blue-100 max-w-xl mx-auto leading-relaxed mb-2">
                A look back at everything we built, everyone we brought
                together, and every boundary we pushed.
              </p>
            </FadeIn>

            <FadeIn delay={500}>
              <div className="mt-6 max-w-xs mx-auto">
                <YearProgress />
              </div>
            </FadeIn>

            <FadeIn delay={700}>
              <div className="mt-12 flex items-center justify-center">
                <div className="w-8 h-12 rounded-full border-2 border-bt-blue-300/30 flex items-start justify-center p-2">
                  <div className="w-1 h-3 rounded-full bg-bt-green-300 animate-bounce" />
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <Marquee items={eventNames} />

        <section className="relative py-28 md:py-40 px-6">
          <ParticleField count={15} />
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-bt-green-300" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                  by the numbers
                </span>
              </div>
              <h2 className="text-4xl md:text-[52px] font-bold mb-16 md:mb-24 leading-tight">
                This year at a glance
              </h2>
            </FadeIn>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  label: "Events Hosted",
                  value: totalEvents,
                  icon: <CalendarDays className="w-5 h-5" />,
                  color: "from-bt-green-400 to-bt-green-300",
                  glow: "rgba(117,212,80,0.15)",
                },
                {
                  label: "Total Registrations",
                  value: totalRegistrations,
                  icon: <Users className="w-5 h-5" />,
                  color: "from-[#75CFF5] to-[#A2B1D5]",
                  glow: "rgba(117,207,245,0.15)",
                },
                {
                  label: "New Members",
                  value: totalNewMembers,
                  icon: <TrendingUp className="w-5 h-5" />,
                  color: "from-[#FFC960] to-[#FF8A9E]",
                  glow: "rgba(255,201,96,0.15)",
                },
                {
                  label: "Unique Attendees",
                  value: uniqueAttendees,
                  icon: <UserCheck className="w-5 h-5" />,
                  color: "from-[#9F8AD1] to-[#75CFF5]",
                  glow: "rgba(159,138,209,0.15)",
                },
              ].map((stat, i) => (
                <FadeIn key={stat.label} delay={i * 120}>
                  <GlowCard glowColor={stat.glow} className="p-5 md:p-8">
                    <div
                      className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-3 md:mb-4`}
                    >
                      <span className="text-bt-blue-700">{stat.icon}</span>
                    </div>
                    <p className="text-3xl md:text-[44px] font-bold tabular-nums font-redhat leading-none">
                      <Counter end={stat.value} />
                    </p>
                    <p className="text-xs md:text-sm text-bt-blue-100 mt-2">
                      {stat.label}
                    </p>
                  </GlowCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider
          quote="BizTech pushes people to achievements they never thought were possible"
          author="Lucas Gingera - President"
        />

        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-bt-green-300" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                  the journey
                </span>
              </div>
              <h2 className="text-3xl md:text-[48px] font-bold mb-14 md:mb-18 leading-tight">
                Every event, every moment
              </h2>
            </FadeIn>

            <div className="relative">
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-bt-green-400/60 via-bt-blue-300/20 to-transparent" />
              <div className="space-y-6 md:space-y-8">
                {eventTimeline.map((event, i) => (
                  <FadeIn
                    key={`${event.id}-${event.year}`}
                    delay={Math.min(i * 60, 500)}
                  >
                    <div className="relative pl-12 md:pl-16 group">
                      <div className="absolute left-2.5 md:left-4 top-3 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-bt-green-400 bg-bt-blue-700 group-hover:bg-bt-green-400 transition-colors duration-300 z-10">
                        <div className="absolute inset-0 rounded-full bg-bt-green-400/30 animate-pulse-ring opacity-0 group-hover:opacity-100" />
                      </div>
                      <GlowCard className="p-4 md:p-5 transition-all duration-300 hover:translate-x-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-bt-green-300 font-medium mb-1 font-redhat">
                              {formatDate(event.startDate)}
                              <span className="ml-2 text-bt-blue-300">
                                {dayOfWeek(event.startDate)}
                              </span>
                            </p>
                            <h3 className="text-sm md:text-md font-bold truncate">
                              {event.ename}
                            </h3>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bt-blue-200 mt-2">
                          {event.elocation && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.elocation}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-redhat">
                            <Users className="w-3 h-3" />
                            {event.regCount} registered
                          </span>
                        </div>
                      </GlowCard>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>

            {firstEvent && lastEvent && firstEvent !== lastEvent && (
              <FadeIn delay={200}>
                <div className="mt-12 relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-bt-green-400/5 via-transparent to-[#FF8A9E]/5" />
                  <div className="relative grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-0">
                    <GlowCard
                      glowColor="rgba(117,212,80,0.12)"
                      className="p-6 md:p-8 text-center sm:text-left rounded-2xl sm:rounded-r-none border-r-0 sm:border-r-0"
                    >
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="p-3 rounded-xl bg-bt-green-400/10 border border-bt-green-400/20 flex-shrink-0">
                          <Sunrise className="w-6 h-6 text-bt-green-300" />
                        </div>
                        <div>
                          <p className="text-[10px] text-bt-green-300 uppercase tracking-[0.2em] font-semibold mb-1">
                            where it began
                          </p>
                          <p className="text-lg md:text-xl font-bold">
                            {firstEvent.ename}
                          </p>
                          <p className="text-xs text-bt-blue-200 mt-1">
                            {formatFullDate(firstEvent.startDate)}
                          </p>
                        </div>
                      </div>
                    </GlowCard>

                    <div className="hidden sm:flex flex-col items-center gap-1 px-4 z-10">
                      <div className="w-px h-6 bg-gradient-to-b from-bt-green-400/40 to-transparent" />
                      <div className="w-10 h-10 rounded-full border border-bt-blue-300/20 bg-bt-blue-700 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4 text-bt-blue-200" />
                      </div>
                      <div className="w-px h-6 bg-gradient-to-b from-transparent to-[#FF8A9E]/40" />
                    </div>

                    <div className="flex justify-center sm:hidden py-3">
                      <div className="w-8 h-8 rounded-full border border-bt-blue-300/20 bg-bt-blue-700 flex items-center justify-center rotate-90">
                        <ChevronRight className="w-4 h-4 text-bt-blue-200" />
                      </div>
                    </div>

                    <GlowCard
                      glowColor="rgba(255,138,158,0.12)"
                      className="p-6 md:p-8 text-center sm:text-right rounded-2xl sm:rounded-l-none"
                    >
                      <div className="flex flex-col sm:flex-row-reverse items-center sm:items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#FF8A9E]/10 border border-[#FF8A9E]/20 flex-shrink-0">
                          <Sunset className="w-6 h-6 text-[#FF8A9E]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-[#FF8A9E] uppercase tracking-[0.2em] font-semibold mb-1">
                            most recent
                          </p>
                          <p className="text-lg md:text-xl font-bold">
                            {lastEvent.ename}
                          </p>
                          <p className="text-xs text-bt-blue-200 mt-1">
                            {formatFullDate(lastEvent.startDate)}
                          </p>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </section>

        <SectionDivider
          quote="Through BizTech, I found a team that challenges me to keep learning, keep building, and keep giving back"
          author="Grace Co - President"
        />

        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-bt-green-300" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                  who we are
                </span>
              </div>
              <h2 className="text-3xl md:text-[48px] font-bold mb-14 md:mb-18 leading-tight">
                Our community
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {genderBreakdown.length > 0 && (
                <FadeIn delay={0} className="h-full">
                  <GlowCard
                    glowColor="rgba(255,154,248,0.1)"
                    className="p-5 md:p-6 h-full"
                  >
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF9AF8]" />
                      Gender
                    </h3>
                    <MiniDonut
                      segments={genderBreakdown.map((g, i) => ({
                        label: g.name,
                        value: g.count,
                        color: CHART_COLORS[i % CHART_COLORS.length],
                      }))}
                      size={150}
                    />
                  </GlowCard>
                </FadeIn>
              )}

              {yearLevelBreakdown.length > 0 && (
                <FadeIn delay={100} className="h-full">
                  <GlowCard
                    glowColor="rgba(255,201,96,0.1)"
                    className="p-5 md:p-6 h-full"
                  >
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#FFC960]" />
                      Year Level
                    </h3>
                    <div className="space-y-2.5">
                      {yearLevelBreakdown.slice(0, 6).map((y, i) => (
                        <div key={y.name} className="flex items-center gap-2">
                          <span className="text-xs text-bt-blue-200 w-20 text-right truncate">
                            {y.name}
                          </span>
                          <div className="flex-1 h-5 rounded-md bg-bt-blue-500/30 overflow-hidden">
                            <div
                              className="h-full rounded-md transition-all duration-700"
                              style={{
                                width: `${(y.count / (yearLevelBreakdown[0]?.count || 1)) * 100}%`,
                                backgroundColor:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-bt-blue-100 tabular-nums w-8 text-right font-redhat">
                            {y.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                </FadeIn>
              )}

              {facultyBreakdown.length > 0 && (
                <FadeIn delay={200} className="h-full">
                  <GlowCard
                    glowColor="rgba(159,138,209,0.1)"
                    className="p-5 md:p-6 h-full"
                  >
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#9F8AD1]" />
                      Faculty
                    </h3>
                    <div className="space-y-2.5">
                      {facultyBreakdown.slice(0, 6).map((f, i) => (
                        <div key={f.name} className="flex items-center gap-2">
                          <span className="text-xs text-bt-blue-200 w-24 text-right truncate">
                            {f.name}
                          </span>
                          <div className="flex-1 h-5 rounded-md bg-bt-blue-500/30 overflow-hidden">
                            <div
                              className="h-full rounded-md transition-all duration-700"
                              style={{
                                width: `${(f.count / (facultyBreakdown[0]?.count || 1)) * 100}%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 4) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-bt-blue-100 tabular-nums w-8 text-right font-redhat">
                            {f.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                </FadeIn>
              )}

              {topMajors.length > 0 && (
                <FadeIn delay={300} className="h-full">
                  <GlowCard className="p-5 md:p-6 h-full">
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <Award className="w-4 h-4 text-bt-green-300" />
                      Top Majors
                    </h3>
                    <div className="space-y-2">
                      {topMajors.slice(0, 8).map((m, i) => (
                        <div
                          key={m.name}
                          className="flex items-center gap-2 group"
                        >
                          <span className="text-[10px] text-bt-blue-300 w-4 text-right tabular-nums font-redhat group-hover:text-bt-green-300 transition-colors">
                            {i + 1}
                          </span>
                          <span className="text-xs text-bt-blue-100 flex-1 truncate group-hover:text-white transition-colors">
                            {m.name}
                          </span>
                          <span className="text-xs font-medium text-bt-blue-200 tabular-nums font-redhat">
                            {m.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                </FadeIn>
              )}

              {dietBreakdown.length > 0 && (
                <FadeIn delay={400} className="h-full">
                  <GlowCard
                    glowColor="rgba(255,138,158,0.1)"
                    className="p-5 md:p-6 h-full"
                  >
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#FF8A9E]" />
                      Dietary Preferences
                    </h3>
                    <MiniDonut
                      segments={dietBreakdown.map((d, i) => ({
                        label: d.name,
                        value: d.count,
                        color: CHART_COLORS[(i + 2) % CHART_COLORS.length],
                      }))}
                      size={150}
                    />
                  </GlowCard>
                </FadeIn>
              )}

              {heardFromBreakdown.length > 0 && (
                <FadeIn delay={500} className="h-full">
                  <GlowCard
                    glowColor="rgba(117,207,245,0.1)"
                    className="p-5 md:p-6 h-full"
                  >
                    <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-[#75CFF5]" />
                      How They Found Us
                    </h3>
                    <div className="space-y-2.5">
                      {heardFromBreakdown.slice(0, 6).map((h, i) => (
                        <div key={h.name} className="flex items-center gap-2">
                          <span className="text-xs text-bt-blue-200 w-20 text-right truncate">
                            {h.name}
                          </span>
                          <div className="flex-1 h-5 rounded-md bg-bt-blue-500/30 overflow-hidden">
                            <div
                              className="h-full rounded-md transition-all duration-700"
                              style={{
                                width: `${(h.count / (heardFromBreakdown[0]?.count || 1)) * 100}%`,
                                backgroundColor:
                                  CHART_COLORS[(i + 5) % CHART_COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-bt-blue-100 tabular-nums w-8 text-right font-redhat">
                            {h.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </GlowCard>
                </FadeIn>
              )}
            </div>
          </div>
        </section>

        {venueList.length > 0 && (
          <section className="py-24 md:py-32 px-6">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-bt-green-300" />
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                    where we went
                  </span>
                </div>
                <h2 className="text-3xl md:text-[48px] font-bold mb-14 md:mb-18 leading-tight">
                  {uniqueVenues} unique venues
                </h2>
              </FadeIn>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {venueList.map((v, i) => (
                  <ScaleIn key={v.name} delay={Math.min(i * 60, 400)}>
                    <div className="rounded-xl border border-bt-blue-300/10 bg-bt-blue-600/20 p-4 flex items-center gap-3 hover:border-bt-blue-300/25 hover:bg-bt-blue-600/30 transition-all duration-300 group">
                      <div className="p-2 rounded-lg bg-bt-blue-500/30 group-hover:bg-bt-green-400/10 transition-colors">
                        <MapPin className="w-4 h-4 text-bt-blue-100 group-hover:text-bt-green-300 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.name}</p>
                        <p className="text-[10px] text-bt-blue-300 font-redhat">
                          {v.count} event{v.count !== 1 && "s"}
                        </p>
                      </div>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </section>
        )}

        <SectionDivider quote="every team, one mission" />

        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-bt-green-300" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                  behind the scenes
                </span>
              </div>
              <h2 className="text-3xl md:text-[48px] font-bold mb-6 leading-tight">
                What each team shipped
              </h2>
              <p className="text-bt-blue-200 text-sm md:text-base max-w-2xl mb-14 md:mb-18 leading-relaxed">
                A look at the numbers behind every department that made this
                year happen.
              </p>
            </FadeIn>

            {/* experiences */}
            <FadeIn delay={0}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#FF8A9E]/10 border border-[#FF8A9E]/20">
                    <Mic className="w-5 h-5 text-[#FF8A9E]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">
                      Experiences
                    </h3>
                    <p className="text-xs text-bt-blue-300">
                      the events that brought us together
                    </p>
                  </div>
                </div>

                {largestEvent && (
                  <div className="mb-4">
                    <GlowCard
                      glowColor="rgba(255,138,158,0.12)"
                      className="p-5 md:p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-[#FFC960] mb-2">
                            <Trophy className="w-4 h-4" />
                            <span className="text-[10px] font-semibold tracking-[0.15em] uppercase">
                              biggest event
                            </span>
                          </div>
                          <h4 className="text-lg md:text-xl font-bold mb-1">
                            {largestEvent.event.ename}
                          </h4>
                          <p className="text-xs text-bt-blue-200">
                            {formatDate(largestEvent.event.startDate)}{" "}
                            {largestEvent.event.elocation &&
                              `\u00b7 ${largestEvent.event.elocation}`}
                          </p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl md:text-5xl font-bold text-[#FFC960] font-redhat leading-none">
                            <Counter end={largestEvent.count} />
                          </span>
                          <span className="text-xs text-bt-blue-200">
                            registrations
                          </span>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                )}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4">
                  {(
                    [
                      {
                        label: "Events Hosted",
                        value: totalEvents,
                        icon: <CalendarDays className="w-4 h-4" />,
                        color: "#FF8A9E",
                      },
                      {
                        label: "Total Registrations",
                        value: totalRegistrations,
                        icon: <Users className="w-4 h-4" />,
                        color: "#9F8AD1",
                      },
                      {
                        label: "Unique Attendees",
                        value: uniqueAttendees,
                        icon: <UserCheck className="w-4 h-4" />,
                        color: "#75CFF5",
                      },
                      {
                        label: "New Members",
                        value: totalNewMembers,
                        icon: <UserPlus className="w-4 h-4" />,
                        color: "#FFC960",
                      },
                    ] as {
                      label: string;
                      value: number;
                      icon: React.ReactNode;
                      color: string;
                    }[]
                  ).map((stat, i) => (
                    <ScaleIn key={stat.label} delay={i * 80}>
                      <GlowCard
                        glowColor={`${stat.color}15`}
                        className="p-4 md:p-5 h-full"
                      >
                        <div
                          className="flex items-center gap-2 mb-3"
                          style={{ color: stat.color }}
                        >
                          {stat.icon}
                          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold font-redhat">
                          <Counter end={stat.value} />
                        </p>
                      </GlowCard>
                    </ScaleIn>
                  ))}
                </div>

                <FadeIn delay={300}>
                  <div className="grid grid-cols-5 gap-3">
                    {(
                      [
                        {
                          label: "Avg Regs / Event",
                          value: avgRegsPerEvent,
                          icon: <Hash className="w-3.5 h-3.5 text-[#FFC960]" />,
                        },
                        {
                          label: "Super Fans (3+)",
                          value: superFans,
                          icon: (
                            <Trophy className="w-3.5 h-3.5 text-[#FF8A9E]" />
                          ),
                        },
                        {
                          label: "Unique Venues",
                          value: uniqueVenues,
                          icon: (
                            <MapPin className="w-3.5 h-3.5 text-[#75CFF5]" />
                          ),
                        },
                        {
                          label: "Event Hours",
                          value: Math.round(totalEventHours),
                          icon: (
                            <Clock className="w-3.5 h-3.5 text-[#75D450]" />
                          ),
                        },
                        {
                          label: "Avg Duration",
                          value: `${avgEventDuration}h`,
                          icon: (
                            <Clock className="w-3.5 h-3.5 text-[#C084FC]" />
                          ),
                        },
                      ] as {
                        label: string;
                        value: number | string;
                        icon: React.ReactNode;
                      }[]
                    ).map((stat, i) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-bt-blue-300/10 bg-bt-blue-600/20 p-2.5 text-center hover:bg-bt-blue-600/30 hover:border-bt-blue-300/20 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center mb-1">
                          {stat.icon}
                        </div>
                        <p className="text-sm md:text-lg font-bold tabular-nums font-redhat">
                          {stat.value}
                        </p>
                        <p className="text-[9px] md:text-[10px] text-bt-blue-300 mt-0.5">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>
            </FadeIn>

            {/* partnerships */}
            <FadeIn delay={0}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#75CFF5]/10 border border-[#75CFF5]/20">
                    <Handshake className="w-5 h-5 text-[#75CFF5]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">
                      Partnerships
                    </h3>
                    <p className="text-xs text-bt-blue-300">
                      building bridges with industry
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    {
                      label: "Company Partners",
                      value: 32,
                      icon: <Building2 className="w-4 h-4" />,
                      color: "#75CFF5",
                    },
                    {
                      label: "Revenue Secured",
                      value: 18.7,
                      prefix: "$",
                      suffix: "k",
                      decimals: 1,
                      icon: <DollarSign className="w-4 h-4" />,
                      color: "#75D450",
                      subtext: "up from $14.4k last year",
                    },
                    {
                      label: "In-kinds Secured",
                      value: 20,
                      icon: <Handshake className="w-4 h-4" />,
                      color: "#FFC960",
                    },
                    {
                      label: "Summer Outreaches",
                      value: 3,
                      suffix: "k",
                      icon: <Send className="w-4 h-4" />,
                      color: "#FF9AF8",
                    },
                  ].map(
                    (
                      stat: {
                        label: string;
                        value: number;
                        icon: React.ReactNode;
                        color: string;
                        prefix?: string;
                        suffix?: string;
                        decimals?: number;
                        subtext?: string;
                      },
                      i,
                    ) => (
                      <ScaleIn key={stat.label} delay={i * 80}>
                        <GlowCard
                          glowColor={`${stat.color}15`}
                          className="p-4 md:p-5 h-full"
                        >
                          <div
                            className="flex items-center gap-2 mb-3"
                            style={{ color: stat.color }}
                          >
                            {stat.icon}
                            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-2xl md:text-3xl font-bold font-redhat">
                            <Counter
                              end={stat.value}
                              prefix={stat.prefix}
                              suffix={stat.suffix}
                              decimals={stat.decimals || 0}
                            />
                          </p>
                          {stat.subtext && (
                            <p className="text-[10px] text-bt-green-300/70 mt-1">
                              {stat.subtext}
                            </p>
                          )}
                        </GlowCard>
                      </ScaleIn>
                    ),
                  )}
                </div>

                {/* event partner breakdown */}
                <FadeIn delay={300}>
                  <GlowCard
                    glowColor="rgba(117,207,245,0.08)"
                    className="p-5 md:p-7"
                  >
                    <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-[#75CFF5] mb-5 flex items-center gap-2">
                      <Target className="w-3.5 h-3.5" />
                      Partners per event
                    </h4>
                    <div className="space-y-3">
                      {[
                        { event: "Blueprint", partners: 85, color: "#75D450" },
                        { event: "Kickstart", partners: 60, color: "#FFC960" },
                        { event: "UX Open", partners: 38, color: "#FF9AF8" },
                        { event: "Produhacks", partners: 30, color: "#9F8AD1" },
                        { event: "HelloHacks", partners: 30, color: "#75CFF5" },
                        { event: "TechStrat", partners: 24, color: "#EB8273" },
                        { event: "MIS Night", partners: 10, color: "#A2B1D5" },
                      ].map((item, i) => {
                        const maxPartners = 85;
                        return (
                          <FadeIn key={item.event} delay={400 + i * 60}>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-bt-blue-200 w-24 text-right font-medium shrink-0">
                                {item.event}
                              </span>
                              <div className="flex-1 h-7 rounded-lg bg-bt-blue-500/30 overflow-hidden relative">
                                <div
                                  className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                                  style={{
                                    width: `${(item.partners / maxPartners) * 100}%`,
                                    backgroundColor: `${item.color}30`,
                                    borderRight: `3px solid ${item.color}`,
                                  }}
                                >
                                  <span
                                    className="text-[11px] font-bold font-redhat"
                                    style={{ color: item.color }}
                                  >
                                    ~{item.partners}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </FadeIn>
                        );
                      })}
                    </div>
                    <div className="mt-5 pt-4 border-t border-bt-blue-300/10 grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-lg font-bold font-redhat text-[#75CFF5]">
                          <Counter end={2} suffix="k" />
                        </p>
                        <p className="text-[10px] text-bt-blue-300">
                          outreaches during school year
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold font-redhat text-[#FFC960]">
                          <Counter end={100} suffix="+" />
                        </p>
                        <p className="text-[10px] text-bt-blue-300">
                          leads generated by summer
                        </p>
                      </div>
                    </div>
                  </GlowCard>
                </FadeIn>
              </div>
            </FadeIn>

            {/* finance */}
            <FadeIn delay={100}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#75D450]/10 border border-[#75D450]/20">
                    <DollarSign className="w-5 h-5 text-[#75D450]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">Finance</h3>
                    <p className="text-xs text-bt-blue-300">
                      keeping the books balanced
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  {[
                    {
                      label: "Gross Volume",
                      value: 28496.7,
                      prefix: "$",
                      decimals: 0,
                      icon: <DollarSign className="w-4 h-4" />,
                      color: "#75D450",
                    },
                    {
                      label: "Successful Payments",
                      value: 986,
                      icon: <CreditCard className="w-4 h-4" />,
                      color: "#75CFF5",
                    },
                    {
                      label: "Reimbursed to Execs",
                      value: 16205.25,
                      prefix: "$",
                      decimals: 0,
                      icon: <Receipt className="w-4 h-4" />,
                      color: "#FFC960",
                    },
                  ].map(
                    (
                      stat: {
                        label: string;
                        value: number;
                        icon: React.ReactNode;
                        color: string;
                        prefix?: string;
                        suffix?: string;
                        decimals?: number;
                      },
                      i,
                    ) => (
                      <ScaleIn key={stat.label} delay={i * 80}>
                        <GlowCard
                          glowColor={`${stat.color}15`}
                          className="p-4 md:p-5 h-full"
                        >
                          <div
                            className="flex items-center gap-2 mb-3"
                            style={{ color: stat.color }}
                          >
                            {stat.icon}
                            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                              {stat.label}
                            </span>
                          </div>
                          <p className="text-2xl md:text-3xl font-bold font-redhat">
                            <Counter
                              end={stat.value}
                              prefix={stat.prefix}
                              suffix={stat.suffix}
                              decimals={stat.decimals || 0}
                            />
                          </p>
                        </GlowCard>
                      </ScaleIn>
                    ),
                  )}
                </div>
              </div>
            </FadeIn>

            {/* marketing */}
            <FadeIn delay={200}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#FF9AF8]/10 border border-[#FF9AF8]/20">
                    <Megaphone className="w-5 h-5 text-[#FF9AF8]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">Marketing</h3>
                    <p className="text-xs text-bt-blue-300">
                      spreading the word
                    </p>
                  </div>
                </div>
                {/* hero numbers */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                  {[
                    {
                      label: "Accounts Reached",
                      value: 338706,
                      icon: <Eye className="w-5 h-5" />,
                      color: "#FF9AF8",
                    },
                    {
                      label: "Total Post Views",
                      value: 1179018,
                      icon: <Eye className="w-5 h-5" />,
                      color: "#9F8AD1",
                    },
                  ].map((stat, i) => (
                    <ScaleIn key={stat.label} delay={i * 80}>
                      <GlowCard
                        glowColor={`${stat.color}15`}
                        className="p-5 md:p-7 h-full"
                      >
                        <div
                          className="flex items-center gap-2 mb-3"
                          style={{ color: stat.color }}
                        >
                          {stat.icon}
                          <span className="text-[10px] md:text-xs font-semibold tracking-[0.12em] uppercase">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-3xl sm:text-4xl md:text-[44px] font-bold font-redhat leading-none">
                          <Counter end={stat.value} />
                        </p>
                      </GlowCard>
                    </ScaleIn>
                  ))}
                </div>
                {/* secondary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
                  {[
                    {
                      label: "New Followers",
                      value: 1577,
                      icon: <UserPlus className="w-4 h-4" />,
                      color: "#75CFF5",
                    },
                    {
                      label: "Likes",
                      value: 10608,
                      icon: <ThumbsUp className="w-4 h-4" />,
                      color: "#FF8A9E",
                    },
                    {
                      label: "Comments",
                      value: 1088,
                      icon: <MessageCircle className="w-4 h-4" />,
                      color: "#FFC960",
                    },
                    {
                      label: "Shares",
                      value: 7622,
                      icon: <Share2 className="w-4 h-4" />,
                      color: "#75D450",
                    },
                    {
                      label: "New Saves",
                      value: 904,
                      icon: <Bookmark className="w-4 h-4" />,
                      color: "#EB8273",
                    },
                  ].map((stat, i) => (
                    <ScaleIn key={stat.label} delay={150 + i * 60}>
                      <GlowCard
                        glowColor={`${stat.color}15`}
                        className="p-4 md:p-5 h-full"
                      >
                        <div
                          className="flex items-center gap-2 mb-3"
                          style={{ color: stat.color }}
                        >
                          {stat.icon}
                          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold font-redhat">
                          <Counter end={stat.value} />
                        </p>
                      </GlowCard>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* internal */}
            <FadeIn delay={300}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#D1C68A]/10 border border-[#D1C68A]/20">
                    <Home className="w-5 h-5 text-[#D1C68A]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">Internal</h3>
                    <p className="text-xs text-bt-blue-300">
                      keeping the family together
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                  {[
                    {
                      label: "Intramurals Titles",
                      value: 2,
                      icon: <Trophy className="w-4 h-4" />,
                      color: "#FFC960",
                      detail: "back-to-back champions 🏆",
                    },
                    {
                      label: "Retreats",
                      value: 2,
                      icon: <Coffee className="w-4 h-4" />,
                      color: "#D1C68A",
                    },
                    {
                      label: "Socials",
                      value: "∞",
                      icon: <PartyPopper className="w-4 h-4" />,
                      color: "#FF8A9E",
                      detail: "too many to count",
                    },
                    {
                      label: "Interviews Conducted",
                      value: 100,
                      suffix: "+",
                      icon: <MessageSquare className="w-4 h-4" />,
                      color: "#9F8AD1",
                    },
                  ].map((stat, i) => (
                    <ScaleIn key={stat.label} delay={i * 80}>
                      <GlowCard
                        glowColor={`${stat.color}15`}
                        className="p-4 md:p-5 h-full"
                      >
                        <div
                          className="flex items-center gap-2 mb-3"
                          style={{ color: stat.color }}
                        >
                          {stat.icon}
                          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                            {stat.label}
                          </span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold font-redhat">
                          {typeof stat.value === "string" ? (
                            stat.value
                          ) : (
                            <Counter end={stat.value} suffix={stat.suffix} />
                          )}
                        </p>
                        {"detail" in stat && stat.detail && (
                          <p className="text-[10px] text-bt-blue-300 mt-1">
                            {stat.detail}
                          </p>
                        )}
                      </GlowCard>
                    </ScaleIn>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* development */}
            <FadeIn delay={400}>
              <div className="mb-12 md:mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#75D450]/10 border border-[#75D450]/20">
                    <Code className="w-5 h-5 text-[#75D450]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">
                      Development
                    </h3>
                    <p className="text-xs text-bt-blue-300">
                      building the tech that powers BizTech
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <ScaleIn delay={0}>
                    <GlowCard
                      glowColor="rgba(117,212,80,0.12)"
                      className="p-5 md:p-7 h-full"
                    >
                      <div className="flex items-center gap-2 mb-2 text-[#75D450]">
                        <Terminal className="w-4 h-4" />
                        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                          Frontend
                        </span>
                      </div>
                      <p className="text-3xl md:text-4xl font-bold font-redhat mb-1">
                        <Counter end={127944} />
                      </p>
                      <p className="text-xs text-bt-blue-300">
                        lines of code written
                      </p>
                      <div className="mt-4 h-1.5 rounded-full bg-bt-blue-500/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#75D450]/60 to-[#75D450] animate-pulse"
                          style={{ width: "35%" }}
                        />
                      </div>
                    </GlowCard>
                  </ScaleIn>
                  <ScaleIn delay={100}>
                    <GlowCard
                      glowColor="rgba(159,138,209,0.12)"
                      className="p-5 md:p-7 h-full"
                    >
                      <div className="flex items-center gap-2 mb-2 text-[#9F8AD1]">
                        <Database className="w-4 h-4" />
                        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                          Backend
                        </span>
                      </div>
                      <p className="text-3xl md:text-4xl font-bold font-redhat mb-1">
                        <Counter end={233784} />
                      </p>
                      <p className="text-xs text-bt-blue-300">
                        lines of code written
                      </p>
                      <div className="mt-4 h-1.5 rounded-full bg-bt-blue-500/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#9F8AD1]/60 to-[#9F8AD1] animate-pulse"
                          style={{ width: "65%" }}
                        />
                      </div>
                    </GlowCard>
                  </ScaleIn>
                </div>
                <FadeIn delay={200}>
                  <div className="mt-4 rounded-xl border border-bt-blue-300/10 bg-bt-blue-600/20 p-4 text-center">
                    <p className="text-sm text-bt-blue-200">
                      <span className="text-2xl md:text-3xl font-bold font-redhat text-white">
                        <Counter end={361728} />
                      </span>
                      <span className="ml-2">
                        total lines across the entire stack
                      </span>
                    </p>
                  </div>
                </FadeIn>
              </div>
            </FadeIn>

            {/* data */}
            <FadeIn delay={500}>
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-[#8AD1C2]/10 border border-[#8AD1C2]/20">
                    <Database className="w-5 h-5 text-[#8AD1C2]" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold">Data</h3>
                    <p className="text-xs text-bt-blue-300">
                      measuring what matters
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <ScaleIn delay={0}>
                    <GlowCard
                      glowColor="rgba(138,209,194,0.12)"
                      className="p-5 md:p-7"
                    >
                      <div className="flex items-center gap-2 mb-3 text-[#8AD1C2]">
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                          Feedback Collected
                        </span>
                      </div>
                      <p className="text-3xl md:text-4xl font-bold font-redhat">
                        <Counter end={450} suffix="+" />
                      </p>
                      <p className="text-xs text-bt-blue-300 mt-1">
                        feedback form responses gathered to improve every event
                      </p>
                    </GlowCard>
                  </ScaleIn>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="py-24 md:py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <FadeIn>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-bt-green-300" />
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-bt-green-300">
                  fun facts
                </span>
              </div>
              <h2 className="text-3xl md:text-[48px] font-bold mb-14 md:mb-18 leading-tight">
                <TypeWriter text="By the way..." speed={60} />
              </h2>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(
                [
                  totalEvents > 0 && {
                    emoji: "\ud83d\udcc5",
                    text: `we hosted an event roughly every ${Math.round((new Date().getTime() - YEAR_START.getTime()) / (1000 * 60 * 60 * 24) / Math.max(totalEvents, 1))} days`,
                  },
                  totalRegistrations > 0 && {
                    emoji: "\ud83c\udfab",
                    text: `that\u2019s ${Math.round(totalRegistrations / Math.max(totalEvents, 1))} registrations per event on average`,
                  },
                  totalEventHours > 0 && {
                    emoji: "\u23f0",
                    text: `we spent ${Math.round(totalEventHours)} total hours hosting events`,
                  },
                  attendeeTiers.fivePlus > 0 && {
                    emoji: "\ud83c\udfc6",
                    text: `${attendeeTiers.fivePlus} people attended 5 or more events. legends.`,
                  },
                  longestStreak > 1 && {
                    emoji: "\ud83d\udd25",
                    text: `our longest streak was ${longestStreak} consecutive weeks with an event`,
                  },
                  avgFillRate > 0 && {
                    emoji: "\ud83d\udca5",
                    text: `our events filled up to ${avgFillRate}% capacity on average`,
                  },
                  peakRegHour.count > 0 && {
                    emoji: "\ud83c\udf19",
                    text: `peak registration time? ${peakRegHour.label}. night owls unite.`,
                  },
                  avgEventDuration > 0 && {
                    emoji: "\ud83d\udcd0",
                    text: `the average event lasted ${avgEventDuration} hours`,
                  },
                  favouriteDay.count > 0 && {
                    emoji: "\ud83d\udcc6",
                    text: `${favouriteDay.count} out of ${totalEvents} events were on a ${favouriteDay.day}. we love ${favouriteDay.day}s.`,
                  },
                ].filter(Boolean) as { emoji: string; text: string }[]
              ).map((fact, i) => (
                <FadeIn key={i} delay={i * 80}>
                  <div className="rounded-xl border border-bt-blue-300/10 bg-bt-blue-600/20 p-5 flex items-start gap-3 hover:bg-bt-blue-600/30 hover:border-bt-blue-300/20 transition-all duration-300 group">
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">
                      {fact.emoji}
                    </span>
                    <p className="text-sm text-bt-blue-100 leading-relaxed">
                      {fact.text}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <SectionDivider
          quote="BizTech has always been a place of innovation and creativity, but I believe our next step is strengthening our foundation."
          author="Chris Lee - Incoming President"
        />

        <section className="relative py-32 md:py-44 px-6 overflow-hidden">
          <ParticleField count={50} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] rounded-full bg-bt-green-400/4 blur-[200px]" />
            <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] rounded-full bg-[#9F8AD1]/4 blur-[160px]" />
            <div className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-[#75CFF5]/3 blur-[140px]" />
            <div className="absolute top-2/3 left-0 w-[500px] h-[500px] rounded-full bg-[#FFC960]/3 blur-[120px]" />
            <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-[#FF8A9E]/3 blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <FadeIn>
              <div className="text-center mb-20 md:mb-28">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-bt-green-300/50" />
                  <Heart className="w-4 h-4 text-bt-green-300" />
                  <span className="text-xs font-semibold tracking-[0.3em] uppercase text-bt-green-300">
                    the people behind it all
                  </span>
                  <Heart className="w-4 h-4 text-bt-green-300" />
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-bt-green-300/50" />
                </div>
                <h2 className="text-5xl md:text-[72px] lg:text-[88px] font-bold mb-6 leading-[1.02]">
                  <span className="block">Meet the</span>
                  <span
                    className="block bg-gradient-to-r from-bt-green-300 via-[#75CFF5] to-[#FF9AF8] bg-clip-text text-transparent animate-gradient-shift"
                    style={{ backgroundSize: "300% 100%" }}
                  >
                    {ACADEMIC_YEAR} Team
                  </span>
                </h2>
                <p className="text-md md:text-lg text-bt-blue-100 max-w-2xl mx-auto leading-relaxed mb-8">
                  <span className="inline-flex items-baseline gap-1">
                    <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-bt-green-300 to-[#75CFF5] bg-clip-text text-transparent">
                      <Counter end={TOTAL_EXEC} duration={2} />
                    </span>
                    <span> incredible humans</span>
                  </span>{" "}
                  who poured everything they had into making this year
                  unforgettable. This one&apos;s for you.
                </p>
                <div className="flex items-center justify-center gap-1.5 group/bar">
                  {EXEC_TEAMS.map((team, i) => (
                    <div
                      key={team.name}
                      className="relative h-1.5 rounded-full transition-all duration-500 hover:h-3 cursor-default group/segment"
                      style={{
                        width: `${Math.max(team.members.length * 10, 20)}px`,
                        backgroundColor: `${team.color}60`,
                      }}
                      title={`${team.name}: ${team.members.length}`}
                    >
                      <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/segment:opacity-100 transition-all duration-300 scale-90 group-hover/segment:scale-100 pointer-events-none"
                        style={{
                          backgroundColor: `${team.color}30`,
                          color: team.color,
                          border: `1px solid ${team.color}30`,
                        }}
                      >
                        {team.name.split(",")[0]} · {team.members.length}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {(() => {
              const coPresidents = EXEC_TEAMS[0].members.slice(0, 2);
              const otherLeadership = EXEC_TEAMS[0].members.slice(2);
              const taglines: Record<string, string> = {
                Leadership:
                  "the visionaries, strategists, and heartbeat of BizTech",
                Experiences:
                  "crafting every event, every vibe, every unforgettable moment",
                Partnerships:
                  "connecting us with the industry&apos;s best and brightest",
                "Marketing, Media, Design":
                  "the creative force behind our brand and every pixel you see",
                Development:
                  "building the tech that powers everything behind the scenes",
                Data: "turning numbers into insights and insights into action",
                Internal: "keeping the team together, energized, and thriving",
                Advisors: "guiding us with wisdom from years of BizTech legacy",
              };

              const renderPersonCard = (
                member: ExecMember,
                color: string,
                idx: number,
                teamIdx: number,
                variant: "hero" | "lead" | "member",
              ) => {
                const initials = member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                const isHero = variant === "hero";
                const isLead = variant === "lead";

                const avatarSize = isHero
                  ? "w-28 h-28 md:w-36 md:h-36"
                  : isLead
                    ? "w-24 h-24 md:w-28 md:h-28"
                    : "w-20 h-20 md:w-24 md:h-24";
                const initialsSize = isHero
                  ? "text-4xl md:text-5xl"
                  : isLead
                    ? "text-3xl md:text-4xl"
                    : "text-2xl md:text-3xl";
                const nameSize = isHero
                  ? "text-2xl md:text-3xl"
                  : isLead
                    ? "text-lg md:text-xl"
                    : "text-sm md:text-base";
                const roleSize = isHero
                  ? "text-sm md:text-md"
                  : isLead
                    ? "text-xs md:text-sm"
                    : "text-[11px] md:text-xs";
                const cardPadding = isHero
                  ? "p-8 md:p-12"
                  : isLead
                    ? "p-6 md:p-8"
                    : "p-5 md:p-6";
                const glowSize = isHero
                  ? "w-64 h-64"
                  : isLead
                    ? "w-48 h-48"
                    : "w-36 h-36";
                const ringInset = isHero
                  ? "-inset-2"
                  : isLead
                    ? "-inset-1.5"
                    : "-inset-1";

                const sparklePositions = isHero
                  ? Array.from({ length: 8 }, (_, i) => ({
                      top: `${15 + Math.random() * 70}%`,
                      left: `${10 + Math.random() * 80}%`,
                      sx: `${(Math.random() - 0.5) * 40}px`,
                      sy: `${-20 - Math.random() * 30}px`,
                      delay: `${i * 0.15}s`,
                      color: i % 2 === 0 ? color : "#fff",
                    }))
                  : [];

                return (
                  <div
                    key={member.name}
                    className={`tilt-card-wrapper ${isHero ? "hero-card-wrap" : ""}`}
                  >
                    {isHero && (
                      <div className="sparkle-container rounded-3xl">
                        {sparklePositions.map((s, i) => (
                          <div
                            key={i}
                            className="sparkle-dot"
                            style={
                              {
                                top: s.top,
                                left: s.left,
                                backgroundColor: s.color,
                                "--sx": s.sx,
                                "--sy": s.sy,
                                animationDelay: s.delay,
                                boxShadow: `0 0 6px ${s.color}`,
                              } as React.CSSProperties
                            }
                          />
                        ))}
                      </div>
                    )}
                    <TiltCard
                      color={color}
                      intensity={isHero ? 8 : isLead ? 10 : 14}
                      className="animate-entrance-pop"
                    >
                      <div
                        className={`${isHero || isLead ? "leadership-card" : ""} exec-card relative rounded-3xl border bg-gradient-to-br overflow-hidden group h-full`}
                        style={
                          {
                            borderColor: `${color}${isHero ? "30" : isLead ? "20" : "15"}`,
                            backgroundImage: `linear-gradient(135deg, ${color}${isHero ? "08" : "05"}, rgba(13,23,44,0.5) 50%, rgba(11,17,30,0.7))`,
                            "--card-color": color,
                            "--glow-color": `${color}40`,
                            animationDelay: `${idx * 100 + teamIdx * 50}ms`,
                          } as React.CSSProperties
                        }
                      >
                        <div
                          className={`absolute top-0 right-0 ${glowSize} rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 transition-all duration-700`}
                          style={{ backgroundColor: `${color}06` }}
                        />
                        <div
                          className={`absolute top-0 right-0 ${glowSize} rounded-full blur-[80px] -translate-y-1/3 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-all duration-700`}
                          style={{ backgroundColor: `${color}18` }}
                        />
                        <div
                          className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 opacity-0 group-hover:opacity-100 transition-all duration-700"
                          style={{ backgroundColor: `${color}0C` }}
                        />

                        <div
                          className={`relative ${cardPadding} flex flex-col items-center text-center gap-4 md:gap-5`}
                        >
                          <div className="relative">
                            <div
                              className={`avatar-ring absolute ${ringInset} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                              style={{
                                background: `conic-gradient(from 0deg, ${color}, transparent 25%, ${color} 50%, transparent 75%, ${color})`,
                              }}
                            />

                            {/* Orbiting dots */}
                            <div className="avatar-orbit-ring">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="orbit-dot"
                                  style={
                                    {
                                      backgroundColor: color,
                                      boxShadow: `0 0 6px ${color}`,
                                      "--orbit-r": isHero
                                        ? "76px"
                                        : isLead
                                          ? "60px"
                                          : "50px",
                                      "--orbit-speed": `${3 + i * 1.5}s`,
                                      animationDelay: `${i * -1}s`,
                                      width: isHero ? "5px" : "3px",
                                      height: isHero ? "5px" : "3px",
                                      margin: isHero ? "-2.5px" : "-1.5px",
                                    } as React.CSSProperties
                                  }
                                />
                              ))}
                            </div>

                            {isHero && (
                              <div
                                className="absolute -inset-4 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-700"
                                style={{
                                  background: `radial-gradient(circle, ${color}15, transparent 70%)`,
                                }}
                              />
                            )}

                            <div
                              className={`avatar-container relative ${avatarSize} rounded-full flex items-center justify-center ${initialsSize} font-bold transition-all duration-500 group-hover:scale-110`}
                              style={
                                {
                                  background: `linear-gradient(135deg, ${color}${isHero ? "45" : "35"}, ${color}10)`,
                                  border: `${isHero ? "3" : "2"}px solid ${color}${isHero ? "40" : "30"}`,
                                  color: color,
                                  "--ring-color": `${color}30`,
                                } as React.CSSProperties
                              }
                            >
                              {member.image ? (
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  width={144}
                                  height={144}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                initials
                              )}
                            </div>
                          </div>

                          <div
                            className={`${isHero ? "mt-3" : "mt-1"} min-h-[3rem] flex flex-col justify-center`}
                          >
                            <p
                              className={`member-name ${nameSize} font-bold leading-tight`}
                              style={
                                {
                                  "--glow-color": `${color}35`,
                                } as React.CSSProperties
                              }
                            >
                              {member.name}
                            </p>
                            {isHero && (
                              <div className="flex items-center justify-center gap-1.5 mt-2">
                                <div
                                  className="h-px flex-1 max-w-[32px]"
                                  style={{
                                    background: `linear-gradient(to right, transparent, ${color}30)`,
                                  }}
                                />
                                <span
                                  className="text-[10px] font-bold tracking-[0.2em] uppercase"
                                  style={{ color: `${color}CC` }}
                                >
                                  ★ Co-President ★
                                </span>
                                <div
                                  className="h-px flex-1 max-w-[32px]"
                                  style={{
                                    background: `linear-gradient(to left, transparent, ${color}30)`,
                                  }}
                                />
                              </div>
                            )}
                            {!isHero && (
                              <p
                                className={`${roleSize} mt-1.5 font-semibold`}
                                style={{ color }}
                              >
                                {member.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </div>
                );
              };

              return (
                <>
                  <FadeIn delay={100}>
                    <div className="mb-20 md:mb-28">
                      <div className="flex items-center gap-4 mb-6">
                        <div
                          className="team-icon-box p-3 rounded-2xl cursor-default"
                          style={
                            {
                              backgroundColor: "#FFC96018",
                              "--team-color": "#FFC96040",
                            } as React.CSSProperties
                          }
                        >
                          <Shield
                            className="w-6 h-6"
                            style={{ color: "#FFC960" }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl md:text-2xl font-bold">
                              Leadership
                            </h3>
                            <span
                              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#FFC96018",
                                color: "#FFC960",
                              }}
                            >
                              {EXEC_TEAMS[0].members.length}
                            </span>
                          </div>
                          <p
                            className="text-xs text-bt-blue-200 mt-0.5"
                            dangerouslySetInnerHTML={{
                              __html: taglines["Leadership"] || "",
                            }}
                          />
                        </div>
                        <div className="hidden sm:block flex-1 max-w-[200px] h-px bg-gradient-to-r from-[#FFC960]/20 to-transparent" />
                      </div>

                      <div className="team-card-grid grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 mb-6">
                        {coPresidents.map((member, i) =>
                          renderPersonCard(member, "#FFC960", i, 0, "hero"),
                        )}
                      </div>

                      <div className="team-card-grid flex flex-wrap justify-center gap-4 md:gap-5">
                        {otherLeadership.map((member, i) => (
                          <div
                            key={member.name}
                            className="w-[calc(50%-8px)] md:w-[calc(33.333%-14px)]"
                          >
                            {renderPersonCard(
                              member,
                              "#FFC960",
                              i + 2,
                              0,
                              "lead",
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </FadeIn>

                  <div className="space-y-20 md:space-y-28">
                    {EXEC_TEAMS.slice(1).map((team, teamIdx) => (
                      <FadeIn
                        key={team.name}
                        delay={Math.min(teamIdx * 80, 400)}
                      >
                        <div
                          className="team-section-divider"
                          style={
                            {
                              "--team-color": team.color,
                            } as React.CSSProperties
                          }
                        >
                          <div className="flex items-center gap-4 mb-8 md:mb-10">
                            <div
                              className="team-icon-box p-3 rounded-2xl transition-all duration-300 cursor-default"
                              style={
                                {
                                  backgroundColor: `${team.color}15`,
                                  "--team-color": `${team.color}40`,
                                } as React.CSSProperties
                              }
                            >
                              <span style={{ color: team.color }}>
                                {team.icon}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg md:text-xl font-bold overflow-hidden">
                                  <span
                                    className="inline-block team-name-reveal"
                                    style={{
                                      animationDelay: `${teamIdx * 80 + 100}ms`,
                                    }}
                                  >
                                    {team.name}
                                  </span>
                                </h3>
                                <span
                                  className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: `${team.color}18`,
                                    color: team.color,
                                  }}
                                >
                                  {team.members.length}
                                </span>
                              </div>
                              <p
                                className="text-[11px] text-bt-blue-300 mt-0.5"
                                dangerouslySetInnerHTML={{
                                  __html: taglines[team.name] || "",
                                }}
                              />
                            </div>
                            <div
                              className="hidden sm:block flex-1 max-w-[200px] h-px"
                              style={{
                                background: `linear-gradient(to right, ${team.color}20, transparent)`,
                              }}
                            />
                          </div>

                          <div
                            className={`team-card-grid grid gap-4 md:gap-5 ${team.members.length <= 2 ? "grid-cols-1 sm:grid-cols-2 max-w-2xl" : "grid-cols-2 md:grid-cols-3"}`}
                          >
                            {team.members.map((member, memberIdx) =>
                              renderPersonCard(
                                member,
                                team.color,
                                memberIdx,
                                teamIdx + 1,
                                "member",
                              ),
                            )}
                          </div>
                        </div>
                      </FadeIn>
                    ))}
                  </div>
                </>
              );
            })()}

            <FadeIn delay={200}>
              <div className="mt-24 md:mt-36 text-center">
                <div className="inline-flex flex-col items-center gap-6">
                  {/* Orbiting team icons */}
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    {/* Center heart */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#FF8A9E]/20 to-[#FF8A9E]/5 border border-[#FF8A9E]/20 flex items-center justify-center backdrop-blur-sm">
                        <Heart className="w-7 h-7 md:w-8 md:h-8 text-[#FF8A9E] animate-breathe" />
                      </div>
                    </div>
                    {/* Orbiting ring */}
                    <div className="absolute inset-0 footer-orbit-ring">
                      {EXEC_TEAMS.map((team, i) => {
                        const angle = (i / EXEC_TEAMS.length) * 360;
                        const rad = (angle * Math.PI) / 180;
                        const radius = 42; // percent from center
                        const x = 50 + radius * Math.cos(rad);
                        const y = 50 + radius * Math.sin(rad);
                        return (
                          <div
                            key={team.name}
                            className="absolute w-9 h-9 md:w-10 md:h-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bt-blue-700 flex items-center justify-center text-[11px] cursor-default transition-all duration-300 hover:scale-150 hover:z-10"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              backgroundColor: `${team.color}25`,
                              color: team.color,
                            }}
                            title={team.name}
                          >
                            {team.icon}
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute inset-[8%] rounded-full border border-dashed border-bt-blue-300/10" />
                  </div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-bt-blue-300/20 bg-bt-blue-600/30 px-7 py-3.5 backdrop-blur-sm">
                    <Heart className="w-5 h-5 text-[#FF8A9E] animate-breathe" />
                    <span className="text-sm md:text-md text-bt-blue-100 font-semibold">
                      {TOTAL_EXEC} people &middot; 1 team &middot; infinite
                      impact
                    </span>
                    <Heart
                      className="w-5 h-5 text-[#FF8A9E] animate-breathe"
                      style={{ animationDelay: "2s" }}
                    />
                  </div>
                  <p className="text-xs text-bt-blue-300 max-w-md leading-relaxed">
                    every event, every registration, every check-in, every late
                    night, every early morning &mdash; made possible by these{" "}
                    {TOTAL_EXEC} extraordinary humans.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <section className="relative py-32 md:py-48 px-6 overflow-hidden">
          <ParticleField count={40} />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-bt-green-400/6 blur-[160px]" />
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-[#9F8AD1]/4 blur-[120px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-[#75CFF5]/4 blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <FadeIn>
              <div className="relative inline-block mb-10">
                <Image
                  src="/assets/biztech_logo.svg"
                  alt="BizTech"
                  width={88}
                  height={88}
                  className="mx-auto opacity-90"
                />
                <div className="absolute inset-0 rounded-full animate-pulse-ring border border-bt-green-300/15" />
                <div
                  className="absolute -inset-4 rounded-full border border-bt-green-300/5 animate-pulse-ring"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h2 className="text-4xl sm:text-[52px] md:text-[68px] font-bold leading-[1.05] mb-8">
                <span className="block">Thank you for being</span>
                <span className="block">part of an</span>
                <span
                  className="block bg-gradient-to-r from-bt-green-300 via-[#75CFF5] to-bt-green-400 bg-clip-text text-transparent animate-gradient-shift mt-1"
                  style={{ backgroundSize: "300% 100%" }}
                >
                  incredible year.
                </span>
              </h2>
            </FadeIn>

            <FadeIn delay={200}>
              <p className="text-md md:text-lg text-bt-blue-100 max-w-lg mx-auto mb-5 leading-relaxed">
                None of this happens without our members, partners, and the
                amazing exec team. Here&apos;s to making next year even bigger.
              </p>
            </FadeIn>

            <FadeIn delay={300}>
              <p className="text-xs text-bt-blue-300 max-w-lg mx-auto mb-14 font-redhat leading-relaxed">
                {totalEvents} events &middot;{" "}
                {totalRegistrations.toLocaleString()} registrations &middot;{" "}
                {totalNewMembers} new members &middot; {uniqueVenues} venues
                &middot; {Math.round(totalEventHours)} hours &middot;{" "}
                {uniqueAttendees} unique people &middot; {TOTAL_EXEC} execs
              </p>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-bt-green-400 text-bt-blue-700 font-semibold text-sm hover:bg-bt-green-300 hover:shadow-[0_0_30px_rgba(117,212,80,0.3)] transition-all duration-300"
                >
                  Browse Events
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-bt-blue-300/30 text-bt-blue-100 font-medium text-sm hover:bg-bt-blue-500/30 transition-all duration-300"
                >
                  Back to Home
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        <footer className="border-t border-bt-blue-300/10 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/biztech_logo.svg"
                alt="BizTech"
                width={24}
                height={24}
              />
              <span className="text-xs text-bt-blue-200">
                UBC BizTech &middot; {ACADEMIC_YEAR}
              </span>
            </div>
            <p className="text-xs text-bt-blue-300 font-instrument italic">
              bridging the gap between business, technology, and you
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const [membersData, eventsData] = await Promise.all([
      fetchBackendFromServer({
        endpoint: `/members`,
        method: "GET",
        nextServerContext: {
          request: context.req,
          response: context.res,
        },
      }),
      fetchBackendFromServer({
        endpoint: `/events`,
        method: "GET",
        authenticatedCall: false,
        nextServerContext: {
          request: context.req,
          response: context.res,
        },
      }),
    ]);

    let registrationsData: Registration[] = [];
    try {
      const allEvents: BiztechEvent[] = Array.isArray(eventsData)
        ? eventsData
        : [];
      const yearEvents = allEvents.filter((e) => inAcademicYear(e.startDate));

      const regResults = await Promise.allSettled(
        yearEvents.map((ev) =>
          fetchBackendFromServer({
            endpoint: `/registrations?eventID=${encodeURIComponent(ev.id)}&year=${ev.year}`,
            method: "GET",
            authenticatedCall: false,
            nextServerContext: {
              request: context.req,
              response: context.res,
            },
          }),
        ),
      );

      for (const result of regResults) {
        if (result.status === "fulfilled" && result.value?.data) {
          registrationsData.push(...result.value.data);
        }
      }
    } catch (regError) {
      console.error("failed to fetch registrations:", regError);
    }

    return {
      props: { membersData, eventsData, registrationsData },
    };
  } catch (error) {
    console.error("failed to fetch year in review data:", error);
    return {
      props: { membersData: null, eventsData: null, registrationsData: null },
    };
  }
};
