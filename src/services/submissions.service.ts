import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Submission, MoscowMatrix } from "@/types/submission.types";

async function ensureSubmission(uid: string) {
  const ref = doc(db, "pbl_submissions", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      initialStoryPoints: {},
      finalStoryPoints: {},
      moscowMatrix: { must: [], should: [], could: [], wont: [] },
      moscowJustification: "",
      githubLink: "",
      pdfUrl: "",
      surpriseAcknowledged: false,
      surpriseRequirements: [],
    });
  }
}

export async function getSubmission(uid: string): Promise<Submission | null> {
  const snap = await getDoc(doc(db, "pbl_submissions", uid));
  return snap.exists() ? (snap.data() as Submission) : null;
}

export async function saveInitialStoryPoints(
  uid: string,
  points: Record<string, number>
): Promise<void> {
  await ensureSubmission(uid);
  await updateDoc(doc(db, "pbl_submissions", uid), { initialStoryPoints: points });
}

export async function saveFinalStoryPoints(
  uid: string,
  points: Record<string, number>
): Promise<void> {
  await updateDoc(doc(db, "pbl_submissions", uid), { finalStoryPoints: points });
}

export async function saveMoscow(
  uid: string,
  matrix: MoscowMatrix,
  justification: string
): Promise<void> {
  await ensureSubmission(uid);
  await updateDoc(doc(db, "pbl_submissions", uid), {
    moscowMatrix: matrix,
    moscowJustification: justification,
  });
}

export async function finalizeSubmission(
  uid: string,
  data: {
    finalStoryPoints: Record<string, number>;
    storyPointsJustification: string;
    githubLink: string;
    pdfUrl: string;
  }
): Promise<void> {
  await updateDoc(doc(db, "pbl_submissions", uid), {
    ...data,
    submittedAt: serverTimestamp(),
  });
}

export async function saveUmlAnswer(
  uid: string,
  key: string,
  value: string
): Promise<void> {
  await ensureSubmission(uid);
  await updateDoc(doc(db, "pbl_submissions", uid), {
    [`umlAnswers.${key}`]: value,
  });
}

export async function acknowledgeSurprise(
  uid: string,
  requirements: string[]
): Promise<void> {
  await ensureSubmission(uid);
  await updateDoc(doc(db, "pbl_submissions", uid), {
    surpriseAcknowledged: true,
    surpriseRequirements: requirements,
    acknowledgedAt: serverTimestamp(),
  });
}
