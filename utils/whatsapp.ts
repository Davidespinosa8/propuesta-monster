export const cleanPhoneNumber = (phone?: string) => {
  return (phone || "").replace(/[^0-9]/g, "");
};

export const buildWhatsAppUrl = (phone: string, message: string) => {
  const cleaned = cleanPhoneNumber(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
};