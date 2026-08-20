import type { Timestamp } from "firebase/firestore";

export interface MoscowMatrix {
  must: string[];
  should: string[];
  could: string[];
  wont: string[];
}

export interface Submission {
  uid: string;
  initialStoryPoints: Record<string, number>;
  finalStoryPoints: Record<string, number>;
  moscowMatrix: MoscowMatrix;
  moscowJustification: string;
  storyPointsJustification?: string;
  githubLink: string;
  pdfUrl: string;
  surpriseAcknowledged: boolean;
  surpriseRequirements?: string[];
  umlAnswers?: Record<string, string>;
  acknowledgedAt?: Timestamp;
  submittedAt?: Timestamp;
}
