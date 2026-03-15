import Image from "next/image";
import Link from "next/link";

type BrandHeaderProps = {
  /** Optional page title below the logo (e.g. "בקשת גישה") */
  title?: string;
  /** Optional short subtitle/description */
  subtitle?: string;
  /** If true, logo links to home. Default true. */
  logoLinkToHome?: boolean;
};

export function BrandHeader({
  title,
  subtitle,
  logoLinkToHome = true,
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
    <header className="border-b border-secondary/20 bg-white/80 pb-6 pt-4 text-right">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 sm:px-12">
        <div className="flex items-center justify-between gap-4">
          {logoLinkToHome ? (
            <Link href="/" className="shrink-0" aria-label="דף הבית">
              {logo}
            </Link>
          ) : (
            <div className="shrink-0">{logo}</div>
          )}
        </div>
        {(title || subtitle) && (
          <div className="space-y-1">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-primary/90 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
