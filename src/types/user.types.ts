import type { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  groupMembers: string[];
  assignedRepoId: 1 | 2 | 3 | null;
  profileCompleted: boolean;
  createdAt: Timestamp;
}
