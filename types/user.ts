export interface AppUser {
  fullName: string;
  businessName: string;
  phone: string;
  plan?: "free" | "pro";
  usageCount?: number;
  role?: string;
  couponUsed?: string;
  portfolioLinks?: string[];
}