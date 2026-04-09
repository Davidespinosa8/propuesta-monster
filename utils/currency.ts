export const convertPrice = (
  price: number,
  currency: "ARS" | "USD",
  exchangeRate: number
) => {
  if (currency === "USD") {
    return price / exchangeRate;
  }

  return price;
};