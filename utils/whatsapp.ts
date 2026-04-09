export const cleanPhoneNumber = (phone?: string) => {
  return (phone || "").replace(/[^0-9]/g, "");
};

export const buildWhatsAppUrl = (
  phone: string,
  message: string,
  countryCode: string = "54"
) => {
  const cleanedPhone = cleanPhoneNumber(phone);
  const fullPhone = `${countryCode}${cleanedPhone}`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
};