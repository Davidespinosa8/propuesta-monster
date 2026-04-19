"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type OwnerBackButtonProps = {
  freelancerId: string;
};

export default function OwnerBackButton({
  freelancerId,
}: OwnerBackButtonProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return null;
  if (user.uid !== freelancerId) return null;

  return (
    <div className="mb-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-black text-gray-500 hover:text-white uppercase tracking-wider transition-colors group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">
          ←
        </span>
        Volver al Dashboard
      </Link>
    </div>
  );
}