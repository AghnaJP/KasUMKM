export const formatRupiah = (value: string | number): string => {
  const numeric =
    typeof value === 'string' ? value.replace(/\D/g, '') : value.toString();
  if (!numeric) {
    return '';
  }
  return `Rp ${numeric.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
};

export const parseRupiah = (formatted: string): number => {
  return Number(formatted.replace(/\D/g, ''));
};
