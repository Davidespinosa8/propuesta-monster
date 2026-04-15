import { Timestamp } from "firebase/firestore";

export type CurrencyCode = "ARS" | "USD";

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
  freelancerBusinessName?: string;
  freelancerPhone?: string;
  clientName: string;
  whatsapp: string;
  portfolioUrl?: string;
  services?: ProposalService[];
  items?: ProposalService[];
  total: number;
  status: "pending" | "accepted";
  createdAt: Timestamp | Date | string | null;
viewedAt?: Timestamp | Date | string | null;
  jobTitle?: string;
  currency?: CurrencyCode;
  countryCode?: string;
  exchangeRateValue?: number;
  exchangeRateSource?: string;
  exchangeRateFetchedAt?: string;
}