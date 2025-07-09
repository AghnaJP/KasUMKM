export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1);
  }

  if (cleaned.startsWith('62')) {
    return cleaned;
  }

  if (cleaned.startsWith('8')) {
    return '62' + cleaned;
  }

  return cleaned;
};
