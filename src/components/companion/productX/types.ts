export interface TeamResponse {
    team: string;
    zScoreWeighted: number;
    judges: string[];
}

export type ScoringMetric =
    | "metric1"
    | "metric2"
    | "metric3"
    | "metric4"
    | "metric5";

export type ScoringRecord = Record<ScoringMetric, number>;

export type TeamFeedback = {
    round: string;
    judgeID: string;
    scores: ScoringRecord;
    feedback: {
        [key: string]: string;
    };
    teamID: string;
    teamName: string;
    createdAt: string;
};

export type RawResponse = {
  message: string;
  scores: Record<string, TeamFeedback[]>;
};