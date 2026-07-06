import Link from "next/link";
import { LogoFull } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-12">
      <Link href="/" className="mb-6" aria-label="PeabiruJobs">
        <LogoFull className="h-32 w-auto" />
      </Link>
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
