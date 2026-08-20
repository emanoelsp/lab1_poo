import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser } from "@/types/user.types";
import type { Submission } from "@/types/submission.types";

export async function triggerSurprise(
  messages: Record<string, string>,
  requirements: Record<string, string[]>
): Promise<void> {
  await setDoc(doc(db, "admin_triggers", "surprise"), {
    isActive: true,
    messages,
    requirements,
    activatedAt: serverTimestamp(),
  });
}

export async function deactivateSurprise(): Promise<void> {
  await setDoc(doc(db, "admin_triggers", "surprise"), {
    isActive: false,
    messages: {},
    requirements: {},
    activatedAt: serverTimestamp(),
  });
}

export async function setSubmissionsOpen(open: boolean): Promise<void> {
  await setDoc(doc(db, "admin_triggers", "submission_control"), {
    submissionsOpen: open,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllStudents(): Promise<AppUser[]> {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AppUser);
}

export async function getSubmissionByUid(uid: string): Promise<Submission | null> {
  const snap = await getDoc(doc(db, "pbl_submissions", uid));
  return snap.exists() ? (snap.data() as Submission) : null;
}
