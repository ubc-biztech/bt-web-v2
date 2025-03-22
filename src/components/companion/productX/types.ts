export interface JudgeResponse {
  judge: string;
  metric1: number;
  metric2: number;
  metric3: number;
  metric4: number;
  metric5: number;
}

export interface TeamResponse {
  teamID: string;
  teamName: string;
  zScoreWeighted: number;
  judges: string[];
  originalResponses: JudgeResponse[];
}

export interface Round {
  round: string;
}

export type ScoringMetric = "metric1" | "metric2" | "metric3" | "metric4" | "metric5";

export type ScoringRecord = Record<ScoringMetric, number>;

export type TeamFeedback = {
  round: string;
  judgeID: string;
  judgeName: string;
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
