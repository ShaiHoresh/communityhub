type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * Reusable page-level heading (h1 + optional subtitle).
 * Placed at the top of <main> after the Global Header was introduced in layout.
 */
export function PageHeading({ title, subtitle, className }: Props) {
  return (
    <div className={`mb-8 ${className ?? ""}`}>
      <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-primary/85">
          {subtitle}
        </p>
      )}
    </div>
  );
}
