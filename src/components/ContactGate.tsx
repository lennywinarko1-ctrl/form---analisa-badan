import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { BRAND_NAME, COACH_NAME } from '../config/appConfig';
import type { ContactInfo } from '../types/assessment';
import { isValidOptionalPhone, normalizeIndonesianPhone } from '../utils/phoneFormatter';

interface ContactGateProps {
  initialContact?: ContactInfo;
  isSubmitting: boolean;
  onSubmit: (contact: ContactInfo) => void;
  onBack: () => void;
}

export function ContactGate({ initialContact, isSubmitting, onSubmit, onBack }: ContactGateProps) {
  const [nickname, setNickname] = useState(initialContact?.nickname ?? '');
  const [igUsername, setIgUsername] = useState(initialContact?.igUsername ?? '');
  const [whatsapp, setWhatsapp] = useState(initialContact?.whatsapp ?? '');
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (!errors[field]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const nextErrors: Record<string, string> = {};
    const cleanName = nickname.trim();
    const cleanIg = igUsername.trim().replace(/^@+/, '').replace(/\s+/g, '');

    if (!cleanName) nextErrors.nickname = 'Isi nama panggilan kamu dulu ya';
    if (!cleanIg || cleanIg.length < 2) nextErrors.igUsername = 'Masukkan username Instagram kamu ya';
    if (!isValidOptionalPhone(whatsapp)) nextErrors.whatsapp = 'Format nomor WA kurang tepat (contoh: 081234567890)';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalizedWa = whatsapp.trim() ? normalizeIndonesianPhone(whatsapp) : '';
    onSubmit({
      nickname: cleanName,
      igUsername: cleanIg,
      whatsapp: normalizedWa || undefined,
      honeypot: honeypot || undefined,
    });
  };

  const inputBase = 'mt-1.5 min-h-[48px] w-full rounded-2xl border bg-[#FAFBF9] px-4 text-sm text-[#1E293B] outline-none transition-colors focus:bg-white';

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-5 flex items-start gap-3.5 rounded-3xl border border-[#059669]/20 bg-[#ECFDF5] p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#059669] shadow-xs">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-[#065F46] sm:text-lg">Skor &amp; Estimasi Protein Harianmu Sudah Siap!</h2>
          <p className="mt-1 text-xs leading-relaxed text-[#047857]">
            Isi kontak singkat di bawah ini untuk membuka hasil skor metabolisme, BMI, serta catatan personal dari {COACH_NAME}.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="gate-nickname" className="block text-sm font-bold text-[#1E293B]">
              Nama Panggilan <span className="text-rose-500">*</span>
            </label>
            <input
              id="gate-nickname"
              type="text"
              autoComplete="given-name"
              placeholder="Contoh: Dina"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); clearError('nickname'); }}
              className={`${inputBase} ${errors.nickname ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#059669]'}`}
            />
            {errors.nickname && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{errors.nickname}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gate-ig" className="block text-sm font-bold text-[#1E293B]">
              Username Instagram <span className="text-rose-500">*</span>
            </label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">@</span>
              <input
                id="gate-ig"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="username_kamu"
                value={igUsername}
                onChange={(e) => { setIgUsername(e.target.value.replace(/^@+/, '').replace(/\s+/g, '')); clearError('igUsername'); }}
                className={`min-h-[48px] w-full rounded-2xl border bg-[#FAFBF9] pl-8 pr-4 text-sm text-[#1E293B] outline-none transition-colors focus:bg-white ${
                  errors.igUsername ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#059669]'
                }`}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Agar {COACH_NAME} mudah mengenali kamu saat diskusi di DM</p>
            {errors.igUsername && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{errors.igUsername}</span>
              </p>
            )}
          </div>

          <div>
            <label htmlFor="gate-wa" className="block text-sm font-bold text-[#1E293B]">Nomor WhatsApp (Opsional)</label>
            <input
              id="gate-wa"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value); clearError('whatsapp'); }}
              className={`${inputBase} tabular-nums ${errors.whatsapp ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#059669]'}`}
            />
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Opsional — isi jika ingin dikirimi hasil via WA. Kalau belum nyaman, boleh dikosongkan!
            </p>
            {errors.whatsapp && (
              <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" /><span>{errors.whatsapp}</span>
              </p>
            )}
          </div>

          <div aria-hidden="true" className="sr-only">
            <label htmlFor="gate-website">Website</label>
            <input id="gate-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#FAFBF9] p-3 text-xs leading-relaxed text-slate-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
          <span>Data kamu 100% rahasia dan hanya digunakan {COACH_NAME} ({BRAND_NAME}) untuk evaluasi personal—tanpa spam.</span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /><span>Kembali</span>
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#047857] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>{isSubmitting ? 'Menyiapkan Hasil...' : 'Buka Hasil Analisa Saya'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
