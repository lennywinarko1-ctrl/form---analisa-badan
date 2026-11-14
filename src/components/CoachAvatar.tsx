import { useState } from 'react';
import { COACH_AVATAR_URL, COACH_NAME } from '../config/appConfig';

interface CoachAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: { outer: 'h-10 w-10', text: 'text-xs', dot: 'h-2.5 w-2.5 right-0 bottom-0' },
  md: { outer: 'h-14 w-14', text: 'text-sm', dot: 'h-3 w-3 right-0.5 bottom-0.5' },
  lg: { outer: 'h-16 w-16', text: 'text-base', dot: 'h-3.5 w-3.5 right-0.5 bottom-0.5' },
};

export function CoachAvatar({ size = 'md', className = '' }: CoachAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const s = SIZE_CLASSES[size];

  return (
    <div className={`relative inline-flex shrink-0 ${s.outer} ${className}`}>
      <div className="h-full w-full rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px] shadow-xs">
        {!imgError ? (
          <img
            src={COACH_AVATAR_URL}
            alt={COACH_NAME}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full rounded-full bg-emerald-50 object-cover"
          />
        ) : (
          <div
            aria-label={COACH_NAME}
            className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 font-extrabold tracking-tight text-white ${s.text}`}
          >
            CV
          </div>
        )}
      </div>
      <span
        aria-hidden="true"
        className={`absolute rounded-full border-2 border-white bg-emerald-500 ${s.dot}`}
      />
    </div>
  );
}
