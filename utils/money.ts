export type CurrencyCode = "ARS" | "USD";

export function getCurrencyLocale(currency: CurrencyCode) {
  if (currency === "USD") return "en-US";
  return "es-AR";
}

export function formatMoney(
  amount: number,
  currency: CurrencyCode = "ARS"
) {
  return new Intl.NumberFormat(getCurrencyLocale(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "ARS" ? 0 : 2,
  }).format(amount || 0);
}

export function getLineItemUnitPrice(item: {
  customPrice?: number;
  price?: number;
}) {
  return item.customPrice ?? item.price ?? 0;
}

export function getLineItemQty(item: { qty?: number }) {
  return item.qty ?? 1;
}

export function getLineItemTotal(item: {
  customPrice?: number;
  price?: number;
  qty?: number;
}) {
  return getLineItemUnitPrice(item) * getLineItemQty(item);
}