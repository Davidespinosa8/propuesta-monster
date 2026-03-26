import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Proposal } from "@/types/proposal";
import { increment, setDoc } from "firebase/firestore";

export const getReferencePricesByCategory = async (category: string) => {
  const ref = doc(db, "precios_referencia", category);
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  const data = snap.data();
  return data?.items || [];
};

export const saveProposalByMode = async ({
  proposalId,
  proposalData,
  userId,
}: {
  proposalId?: string;
  proposalData: Omit<Proposal, "id">;
  userId: string;
}): Promise<string> => {
  if (proposalId) {
    await setDoc(doc(db, "proposals", proposalId), proposalData);
    return proposalId;
  }

  const res = await addDoc(collection(db, "proposals"), proposalData);
  await updateDoc(doc(db, "users", userId), { usageCount: increment(1) });

  return res.id;
};

const getComparableTime = (value: Proposal["createdAt"]): number => {
  if (value instanceof Timestamp) {
    return value.seconds;
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  return 0;
};

export const getProposalById = async (id: string): Promise<Proposal | null> => {
  const ref = doc(db, "proposals", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  } as Proposal;
};

export const getProposalsByFreelancer = async (
  freelancerId: string
): Promise<Proposal[]> => {
  const q = query(
    collection(db, "proposals"),
    where("freelancerId", "==", freelancerId)
  );

  const snap = await getDocs(q);

  const proposals = snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
      }) as Proposal
  );

  proposals.sort((a, b) => {
    return getComparableTime(b.createdAt) - getComparableTime(a.createdAt);
  });

  return proposals;
};

export const createProposal = async (
  proposal: Omit<Proposal, "id">
): Promise<string> => {
  const res = await addDoc(collection(db, "proposals"), proposal);
  return res.id;
};

export const updateProposalById = async (
  id: string,
  proposal: Omit<Proposal, "id">
) => {
  const ref = doc(db, "proposals", id);
  await updateDoc(ref, proposal as Partial<Proposal>);
};

export const deleteProposalById = async (id: string) => {
  const ref = doc(db, "proposals", id);
  await deleteDoc(ref);
};

export const deleteProposalAndReturnUpdatedList = async (
  proposalId: string,
  freelancerId: string
): Promise<Proposal[]> => {
  await deleteProposalById(proposalId);
  return getProposalsByFreelancer(freelancerId);
};