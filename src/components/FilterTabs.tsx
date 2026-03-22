import Link from "next/link";

type Tab = {
  href: string;
  label: string;
  active: boolean;
  color?: string;
};

type Props = {
  tabs: Tab[];
};

export function FilterTabs({ tabs }: Props) {
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            tab.active
              ? "bg-accent text-white shadow-sm hover:shadow"
              : tab.color ?? "border border-secondary/40 bg-white text-primary hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
