import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import ProposalView from "@/components/ProposalView";
import type { Proposal } from "@/types/proposal";
import ProposalViewTracker from "@/components/proposal/ProposalViewTracker";
import OwnerBackButton from "@/components/proposal/OwnerBackButton";

function serializeProposal(proposal: Proposal) {
  return {
    ...proposal,
    createdAt:
      proposal.createdAt instanceof Date
        ? proposal.createdAt.toISOString()
        : proposal.createdAt &&
          typeof proposal.createdAt === "object" &&
          "seconds" in proposal.createdAt
        ? new Date(proposal.createdAt.seconds * 1000).toISOString()
        : null,
    viewedAt:
      proposal.viewedAt &&
      typeof proposal.viewedAt === "object" &&
      "seconds" in proposal.viewedAt
        ? new Date(proposal.viewedAt.seconds * 1000).toISOString()
        : null,
  };
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let proposal: Proposal | null = null;
  let hasError = false;

  try {
    const docRef = doc(db, "proposals", id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const rawData = snap.data() as Omit<Proposal, "id">;

      const proposalData: Proposal = {
        id: snap.id,
        ...rawData,
      };

      proposal = proposalData;
    }
  } catch (error) {
    console.error("Error cargando propuesta:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-500 font-bold uppercase">
        Error al cargar
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-gray-500 font-bold uppercase">
        No encontrado
      </div>
    );
  }
  
  const serializedProposal = serializeProposal(proposal);
  
  return (
    <div className="min-h-screen bg-dark-900 text-white p-4 md:p-8 flex justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-white mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      </div>

      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-500 relative z-10">
        <OwnerBackButton freelancerId={serializedProposal.freelancerId} />

        <ProposalViewTracker
          proposalId={serializedProposal.id}
          freelancerId={serializedProposal.freelancerId}
          viewedAt={serializedProposal.viewedAt ?? null}
        />

        <ProposalView proposal={serializedProposal as Proposal} />
      </div>
    </div>
  );
}