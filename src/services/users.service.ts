import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser } from "@/types/user.types";

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function createProfile(
  uid: string,
  groupMembers: string[]
): Promise<AppUser> {
  const existing = await getUserById(uid);

  // Nunca sobrescrever assignedRepoId se já existir
  const assignedRepoId =
    existing?.assignedRepoId ?? ((Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3);

  const userData: Partial<AppUser> = {
    groupMembers,
    assignedRepoId,
    profileCompleted: true,
  };

  if (!existing) {
    await setDoc(doc(db, "users", uid), {
      uid,
      email: "",
      displayName: "",
      role: "student",
      createdAt: serverTimestamp(),
      ...userData,
    });
  } else {
    await updateDoc(doc(db, "users", uid), userData);
  }

  const updated = await getUserById(uid);
  return updated!;
}

export async function ensureUserDocument(
  uid: string,
  email: string,
  displayName: string
): Promise<AppUser> {
  const existing = await getUserById(uid);
  if (existing) return existing;

  const newUser: Omit<AppUser, "createdAt"> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid,
    email,
    displayName,
    role: "student",
    groupMembers: [],
    assignedRepoId: null,
    profileCompleted: false,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, "users", uid), newUser);
  return getUserById(uid) as Promise<AppUser>;
}
