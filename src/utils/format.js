export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

export function formatQuantity(value, unit = "ml") {
  const n = Number(value);
  if (Number.isNaN(n)) return `0 ${unit}`;
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(n)} ${unit}`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
