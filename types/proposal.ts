import { Timestamp } from "firebase/firestore";

export interface ProposalService {
  id: string;
  title: string;
  price: number;
  desc?: string;
  category?: string;
  unit?: string;
  qty?: number;
  customPrice?: number;
  description?: string;
  type?: string;
  task?: string;
  kind?: "reference" | "manual" | "base";
}

export interface Proposal {
  id: string;
  freelancerId: string;
  freelancerName: string;
  clientName: string;
  whatsapp: string;
  portfolioUrl?: string;
  services?: ProposalService[];
  items?: ProposalService[];
  total: number;
  status: "pending" | "accepted";
  createdAt: Timestamp | Date;
  viewedAt?: Timestamp;
  jobTitle?: string;
  currency?: "ARS" | "USD";
  countryCode?: string;
  exchangeRateValue?: number;
  exchangeRateSource?: string;
  exchangeRateFetchedAt?: string;
}