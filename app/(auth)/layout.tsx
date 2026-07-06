import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-semibold text-brand-700">
        PeabiruJobs
      </Link>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
