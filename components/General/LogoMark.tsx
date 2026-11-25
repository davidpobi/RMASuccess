interface LogoMarkProps {
  className?: string;
}

// Minimal scope/crosshair logo mark — medical device precision
export const LogoMark = ({ className }: LogoMarkProps) => {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Outer circle */}
      <circle cx="16" cy="16" r="13.5" stroke="currentColor" strokeWidth="1.2" />
      {/* Inner circle */}
      <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.2" />
      {/* Crosshair lines */}
      <line x1="16" y1="2" x2="16" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="21.5" x2="16" y2="30" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="2" y1="16" x2="10.5" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="21.5" y1="16" x2="30" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      {/* Center dot */}
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
};
