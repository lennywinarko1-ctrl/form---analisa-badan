import { BRAND_NAME, COACH_NAME, buildWhatsAppUrl } from '../config/appConfig';

export function Header() {
  const whatsappUrl = buildWhatsAppUrl();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#FAFBF9]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-semibold tracking-tight text-[#059669]">
              {BRAND_NAME}
            </span>
          </div>
          <h1 className="truncate text-sm font-bold tracking-tight text-[#1E293B] sm:text-base">
            Evaluasi Kesehatan, Nutrisi &amp; Gaya Hidup
          </h1>
          <p className="truncate text-xs text-slate-500">
            oleh {COACH_NAME} • ± 90 Detik
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp dengan Coach Vera"
          className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-[#059669]/20 bg-[#ECFDF5] px-3.5 py-2 text-xs font-semibold text-[#059669] transition-colors hover:bg-[#059669] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669] active:scale-[0.98]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-4 w-4 shrink-0"
          >
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.77 14.01c-.24.68-1.42 1.3-1.97 1.38-.5.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.07 1.31 2.37 1.46.3.15.47.13.65-.08.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.08.13.08.73-.16 1.41z" />
          </svg>
          <span className="whitespace-nowrap">Chat WA</span>
        </a>
      </div>
    </header>
  );
}
