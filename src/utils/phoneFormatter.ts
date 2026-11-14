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

function cleanIgHandle(igUsername: string): string {
  return igUsername.trim().replace(/^@+/, '').replace(/\s+/g, '');
}

export function buildInstagramDmUrl(igUsername: string): string {
  return `https://www.instagram.com/${cleanIgHandle(igUsername)}/`;
}

export function buildInstagramAppUrl(igUsername: string): string {
  return `instagram://user?username=${cleanIgHandle(igUsername)}`;
}

export function detectIsMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Instagram/i.test(ua) || isTouchMac;
}

export function openInstagramAppWithFallback(igUsername: string): boolean {
  if (typeof window === 'undefined' || window.self !== window.top) return false;

  let handled = false;
  const cleanup = () => {
    handled = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') cleanup();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.location.href = buildInstagramAppUrl(igUsername);
  window.setTimeout(() => {
    if (!handled && document.visibilityState === 'visible') {
      cleanup();
      window.location.assign(buildInstagramDmUrl(igUsername));
    }
  }, 700);

  return true;
}
