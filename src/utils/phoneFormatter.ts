export function normalizeIndonesianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';

  let normalized = digits;
  if (digits.startsWith('0')) {
    normalized = `62${digits.slice(1)}`;
  } else if (digits.startsWith('8')) {
    normalized = `62${digits}`;
  }

  if (!normalized.startsWith('62') || normalized.length < 10 || normalized.length > 15) {
    return '';
  }

  return normalized;
}

export function isValidOptionalPhone(raw: string): boolean {
  if (!raw.trim()) return true;
  const normalized = normalizeIndonesianPhone(raw);
  return normalized.startsWith('628') && normalized.length >= 10 && normalized.length <= 15;
}

export function buildWhatsAppUrl(coachPhone: string, message: string): string {
  const normalized = normalizeIndonesianPhone(coachPhone);
  const clean = normalized || coachPhone.replace(/\D/g, '');
  return `https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(message)}`;
}

export function buildInstagramDmUrl(igUsername: string): string {
  const cleanUsername = igUsername.trim().replace(/^@+/, '').replace(/\s+/g, '');
  return `https://ig.me/m/${cleanUsername}`;
}
