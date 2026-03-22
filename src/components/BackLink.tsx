import Link from "next/link";

type Props = {
  href?: string;
  label?: string;
};

export function BackLink({ href = "/", label = "← חזרה לדף הבית" }: Props) {
  return (
    <Link
      href={href}
      className="mb-8 inline-block text-sm font-medium text-primary/90 transition hover:text-primary hover:underline"
    >
      {label}
    </Link>
  );
}
