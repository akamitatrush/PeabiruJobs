// Logo do PeabiruJobs em SVG inline (sem request extra, escala sem perder qualidade).
// LogoMark = símbolo isolado · Logo = símbolo + wordmark.

export function LogoMark({
  className = "h-8 w-auto",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="50 55 430 290"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="#2EBD8B" strokeWidth="30">
        <path d="M 292 148 L 292 330" />
        <path d="M 292 148 L 344 148 C 386 148 406 172 406 206 C 406 240 386 262 344 262 L 292 262" />
      </g>
      <g fill="none" stroke="#16233F" strokeWidth="32">
        <path d="M 252 96 L 252 330" />
        <path d="M 252 96 L 316 96 C 366 96 390 122 390 160 C 390 198 366 224 316 224 L 252 224" />
      </g>
      <path
        d="M 78 318 C 120 292 150 306 196 282"
        fill="none"
        stroke="#16233F"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M 100 292 C 160 252 200 288 260 254 C 320 220 368 176 442 110"
        fill="none"
        stroke="#2EBD8B"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path d="M 252 214 L 252 302" fill="none" stroke="#16233F" strokeWidth="32" />
      <path
        d="M 0 0 L -40 -17 L -40 17 Z"
        fill="#2EBD8B"
        transform="translate(468 88) rotate(-41)"
      />
    </svg>
  );
}

export function Logo({
  markClassName = "h-8 w-auto",
  textClassName = "text-lg",
}: {
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={markClassName} />
      <span
        className={`font-extrabold tracking-tight text-[#16233F] ${textClassName}`}
      >
        Peabiru
        <span className="font-medium">Jobs</span>
      </span>
    </span>
  );
}
