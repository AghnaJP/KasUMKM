export const formatRupiah = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};
