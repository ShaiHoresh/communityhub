import Image from "next/image";
import Link from "next/link";
import { HeaderAuthButtons } from "./HeaderAuthButtons";

/**
 * Slim sticky nav bar rendered once in the root layout.
 * Right side (RTL start): logo + site name
 * Left side  (RTL end):   auth buttons
 */
export function GlobalHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-secondary/10 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 sm:px-12">
        {/* Logo + name — right side in RTL */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-lg"
          aria-label="CommunityHub – דף הבית"
        >
          <Image
            src="/logo.jpg"
            alt="לוגו הקהילה"
            width={36}
            height={36}
            className="h-9 w-auto object-contain rounded"
            priority
          />
          <span className="hidden font-heading text-sm font-bold tracking-tight text-foreground sm:block">
            CommunityHub
          </span>
        </Link>

        {/* Auth buttons — left side in RTL */}
        <HeaderAuthButtons />
      </div>
    </header>
  );
}
