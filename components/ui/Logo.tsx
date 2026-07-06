// Logo do PeabiruJobs em SVG inline (sem request extra, escala sem perder qualidade).
// LogoMark = símbolo isolado · Logo = símbolo + wordmark.

export function LogoMark({
  className = "h-8 w-auto",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="80 20 450 340"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* trilha completa (verde) + segmento navy — a troca de cor fica atrás das hastes */}
      <path
        d="M 100 330 C 165 288 215 284 268 248 C 316 216 338 208 388 172 C 425 145 445 122 472 94"
        fill="none"
        stroke="#2EBD8B"
        strokeWidth="26"
      />
      <path
        d="M 100 330 C 165 288 215 284 268 248"
        fill="none"
        stroke="#16233F"
        strokeWidth="26"
      />
      <g fill="none" stroke="#2EBD8B" strokeWidth="30">
        <path d="M 293 152 L 293 336" />
        <path d="M 293 152 L 348 152 C 396 152 420 178 420 214 C 420 250 396 276 348 276 L 293 276" />
      </g>
      <g fill="none" stroke="#16233F" strokeWidth="32">
        <path d="M 262 96 L 262 336" />
        <path d="M 262 96 L 326 96 C 376 96 400 122 400 158 C 400 194 376 220 326 220 L 262 220" />
      </g>
      {/* trecho superior da trilha por cima do bojo navy */}
      <path
        d="M 338 208 C 366 190 388 172 388 172 C 425 145 445 122 472 94"
        fill="none"
        stroke="#2EBD8B"
        strokeWidth="26"
      />
      <path
        d="M 0 0 L -64 -28 L -64 28 Z"
        fill="#2EBD8B"
        transform="translate(516 52) rotate(-44)"
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
        <span className="font-semibold">Jobs</span>
      </span>
    </span>
  );
}
