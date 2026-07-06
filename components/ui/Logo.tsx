/* eslint-disable @next/next/no-img-element */
// Logo do PeabiruJobs.
// Os PNGs em /public são derivados do original em branding/PeabiruLogo.png
// (aparado e comprimido para uso web).
//
// LogoMark  = símbolo isolado (headers compactos)
// Logo      = símbolo + wordmark em HTML (texto nítido em qualquer tamanho)
// LogoFull  = lockup completo original (telas com espaço vertical)

export function LogoMark({
  className = "h-8 w-auto",
}: {
  className?: string;
}) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      className={className}
    />
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

export function LogoFull({
  className = "h-28 w-auto",
}: {
  className?: string;
}) {
  return <img src="/logo.png" alt="PeabiruJobs" className={className} />;
}
