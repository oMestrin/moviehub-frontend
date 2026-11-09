const decimal = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatScore = (value) => (value === null || value === undefined ? "–" : decimal.format(value));

export function formatVotes(count) {
  if (!count) return "sem avaliações dos membros";
  return count === 1 ? "1 avaliação" : `${count} avaliações`;
}
