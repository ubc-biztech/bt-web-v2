import { fetchBackend } from "@/lib/db";
import { COMPANION_EMAIL_KEY } from "@/constants/companion";

/**
 * Fetches and calculates all wrapped data for the Blueprint companion
 * @returns Object containing all wrapped statistics and data
 */
export async function getWrappedData(): Promise<{
  totalAttendees: number;
  totalDelegates: number;
  firstConnection: {
    fname: string;
    lname: string;
    pfp: string;
    major: string;
    year: string;
    dateTimestamp: number;
  };
  mbti: {
    acronym: string;
    title: string;
    description: string;
    symbol: string;
    numPeople: number;
  };
  connections: Array<{
    fname: string;
    lname: string;
    pfp: string;
    dateTimestamp: number;
  }>;
  numCompletedQuests: number;
  numTotalQuests: number;
  numCompaniesVisited: number;
  firstCompanyVisited: {
    name: string;
    logo: string;
  };
  topCompanies: Array<{
    rank: number;
    name: string;
    taps: number;
    logo: string;
  }>;
}> {
  try {
    let profileId: string | null = null;
    try {
      profileId = localStorage.getItem(COMPANION_EMAIL_KEY);
    } catch (storageError) {
      // Safari mobile in private mode throws errors when accessing localStorage
      console.warn("localStorage not available (possibly Safari private mode):", storageError);
      throw new Error("Storage not available. Please disable private browsing mode.");
    }
    
    if (!profileId) {
      throw new Error("User not authenticated");
    }

    // TODO: Fetch user connections data
    // const connectionsData = await fetchBackend({
    //   endpoint: `/interactions/journal/${profileId}`,
    //   method: "GET",
    //   authenticatedCall: false,
    // });

    // TODO: Fetch badges/quests data
    // const badgesData = await fetchBackend({
    //   endpoint: `/interactions/quests/${profileId}`,
    //   method: "GET",
    //   authenticatedCall: false,
    // });

    // TODO: Fetch company interactions data
    // const companyData = await fetchBackend({
    //   endpoint: `/companies/interactions/${profileId}`,
    //   method: "GET",
    //   authenticatedCall: false,
    // });

    // TODO: Fetch event attendance data
    // const attendanceData = await fetchBackend({
    //   endpoint: `/events/attendance/${profileId}`,
    //   method: "GET",
    //   authenticatedCall: false,
    // });

    // TODO: Calculate statistics
    // - Total connections made
    // - Total badges earned
    // - Most connected company
    // - Event participation stats
    // - Timeline of activities
    // etc.

    // TODO: Process and format data
    // - Aggregate connection data
    // - Calculate completion percentages
    // - Identify top companies/connections
    // - Generate timeline
    // etc.

    // Placeholder return for now
    console.log("wrapped data is being fetched");
    return {
      totalAttendees: 122,
      totalDelegates: 93,
      firstConnection: {
        fname: "john",
        lname: "doe",
        pfp: "https://i.pravatar.cc/300",
        major: "BUCS",
        year: "4",
        dateTimestamp: 1716230400,
      },
      mbti: {
        acronym: "INTJ",
        title: "The Architect",
        description: "You are a strategic thinker who is able to see the big picture and plan for the future.",
        symbol: "🤔",
        numPeople: 15,
      },
      connections: [
        {
          fname: "john",
          lname: "doe",
          pfp: "https://via.placeholder.com/150",
          dateTimestamp: 1716230400,
        },
        {
          fname: "jane",
          lname: "smith",
          pfp: "https://via.placeholder.com/150",
          dateTimestamp: 1716230400,
        },
        {
          fname: "jim",
          lname: "beam",
          pfp: "https://via.placeholder.com/150",
          dateTimestamp: 1716230400,
        },
        {
          fname: "jill",
          lname: "doe",
          pfp: "https://via.placeholder.com/150",
          dateTimestamp: 1716230400,
        },
        {
          fname: "jack",
          lname: "doe",
          pfp: "https://via.placeholder.com/150",
          dateTimestamp: 1716230400,
        },
      ],
      numCompletedQuests: 10,
      numTotalQuests: 13,
      numCompaniesVisited: 5,
      firstCompanyVisited: {
        name: "Amazon",
        logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/amazon.png",
      },
      topCompanies: [
        {
          rank: 1,
          name: "Amazon",
          taps: 107,
          logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/amazon.png",
        },
        {
          rank: 2,
          name: "Electronic Arts",
          taps: 64,
          logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/ea.png",
        },
        {
          rank: 3,
          name: "Google",
          taps: 59,
          logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/google.png",
        },
        {
          rank: 4,
          name: "Meta",
          taps: 57,
          logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/meta.png",
        },
        {
          rank: 5,
          name: "SAP",
          taps: 44,
          logo: "https://biztech-pfp.s3.us-west-2.amazonaws.com/companies/sap.png",
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching wrapped data:", error);
    throw error;
  }
}

