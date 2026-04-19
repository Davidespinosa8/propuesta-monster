"use client";

import { useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

type ProposalViewTrackerProps = {
  proposalId: string;
  freelancerId: string;
  viewedAt?: string | null;
};

export default function ProposalViewTracker({
  proposalId,
  freelancerId,
  viewedAt,
}: ProposalViewTrackerProps) {
  const { user } = useAuth();

  useEffect(() => {
    const markAsViewed = async () => {
      if (!proposalId || viewedAt) return;

      // Si lo abre el dueño, no marcamos como visto
      if (user?.uid === freelancerId) return;

      try {
        const proposalRef = doc(db, "proposals", proposalId);
        await updateDoc(proposalRef, {
          viewedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error marcando propuesta como vista", error);
      }
    };

    markAsViewed();
  }, [proposalId, freelancerId, viewedAt, user]);

  return null;
}