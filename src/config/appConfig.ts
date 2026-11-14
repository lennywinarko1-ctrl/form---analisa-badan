export const APP_VERSION = '1.1.0';

export const BRAND_NAME = 'transformwithST';
export const COACH_NAME = 'Coach Vera';
// Change to '/coach-vera.jpg' if using a JPG portrait in public/
export const COACH_AVATAR_URL = '/coach-vera.webp';

export const WHATSAPP_NUMBER = '62818673997';
export const INSTAGRAM_USERNAME = 'veraekaraga';

export const GOOGLE_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxMqdEar480Wu9FHSiJ_mPNkCL-nX1Kpjm9QuW02yvbSLBekVmlaZ_J4P0Tc58JCLzd/exec';
export const META_PIXEL_ID = '';

export const WHATSAPP_INTRO_MESSAGE =
  'Halo Coach Vera! Saya lihat evaluasi kesehatan transformwithST dari Instagram, mau tanya-tanya soal program coaching-nya dong 😊';

export function buildWhatsAppUrl(message: string = WHATSAPP_INTRO_MESSAGE): string {
  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encoded}`;
}

export function buildInstagramDmUrl(): string {
  return `https://ig.me/m/${INSTAGRAM_USERNAME}`;
}
