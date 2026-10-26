export const formatScore = (value: number) => `${value.toFixed(2)}`;

export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

export const formatDuration = (years: number) => `${years}y`;
