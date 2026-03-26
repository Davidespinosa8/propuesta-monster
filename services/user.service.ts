import { doc, getDoc, updateDoc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser } from "@/types/user";

export const getUserById = async (uid: string): Promise<AppUser | null> => {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data() as AppUser;
};

export const updateUserById = async (
  uid: string,
  data: Partial<AppUser>
): Promise<void> => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, data);
};

export const createOrMergeUser = async (
  uid: string,
  data: Partial<AppUser>
): Promise<void> => {
  const ref = doc(db, "users", uid);
  await setDoc(ref, data, { merge: true });
};

export const incrementUsageCount = async (uid: string): Promise<void> => {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, { usageCount: increment(1) });
};