import Image from "next/image";
import Link from "next/link";
import { HeaderAuthButtons } from "./HeaderAuthButtons";

type BrandHeaderProps = {
  /** Optional page title below the logo (e.g. "בקשת גישה") */
  title?: string;
  /** Optional short subtitle/description */
  subtitle?: string;
  /** If true, logo links to home. Default true. */
  logoLinkToHome?: boolean;
  /** If true, show auth buttons (Login/Register or user). Default true on main app; admin may set false. */
  showAuth?: boolean;
};

export function BrandHeader({
  title,
  subtitle,
  logoLinkToHome = true,
  showAuth = true,
}: BrandHeaderProps) {
  const logo = (
    <Image
      src="/logo.jpg"
      alt="לוגו הקהילה"
      width={120}
      height={48}
      className="h-12 w-auto object-contain"
      priority
    />
  );

  return (
    <header className="sticky top-0 z-50 border-b border-secondary/10 bg-white/70 pb-6 pt-4 text-right backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 sm:px-12">
        <div className="flex items-center justify-between gap-4">
          {logoLinkToHome ? (
            <Link
              href="/"
              className="shrink-0 transition-opacity hover:opacity-90"
              aria-label="דף הבית"
            >
              {logo}
            </Link>
          ) : (
            <div className="shrink-0">{logo}</div>
          )}
          {showAuth && <HeaderAuthButtons />}
        </div>
        {(title || subtitle) && (
          <div className="space-y-1.5">
            {title && (
              <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="max-w-xl text-sm leading-relaxed text-primary/90">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
