import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";
import { dbGetAllDvarTorah } from "@/lib/db-dvar-torah";
import { BackLink } from "@/components/BackLink";
import { PageHeading } from "@/components/PageHeading";
import { formatBiDate } from "@/lib/hebrew-date";

export const metadata = {
  title: "ארכיון דבר תורה | CommunityHub",
  description: "כל דברי התורה שפורסמו בקהילה",
};

export const dynamic = "force-dynamic";

export default async function DvarTorahArchivePage() {
  const session = await getServerSession(authOptions);
  const status = session?.user ? (session.user as { status?: string }).status : null;
  const isMember = status === "MEMBER" || status === "ADMIN";
  if (!isMember) redirect("/auth/signin");

  const entries = await dbGetAllDvarTorah();

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 text-right">
      <BackLink />
      <PageHeading
        title="ארכיון דבר תורה"
        subtitle="כל דברי התורה שפורסמו על ידי רבני הקהילה, מהחדש לישן."
      />

      {entries.length === 0 ? (
        <div className="surface-card card-interactive p-10 text-center">
          <p className="font-medium text-foreground">לא פורסמו דברי תורה עדיין.</p>
        </div>
      ) : (
        <ol className="space-y-5">
          {entries.map((entry) => (
            <li key={entry.id} className="surface-card overflow-hidden p-0">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-secondary/10 bg-secondary/5 px-6 py-4 transition hover:bg-secondary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 [&::-webkit-details-marker]:hidden">
                  <div>
                    {entry.parasha && (
                      <p className="text-xs font-semibold text-secondary">
                        פרשת {entry.parasha}
                      </p>
                    )}
                    <h2 className="font-heading text-base font-bold text-foreground sm:text-lg">
                      {entry.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-primary/60">
                      {entry.author && `${entry.author} · `}
                      {formatBiDate(entry.date)}
                    </p>
                  </div>
                  <span
                    className="shrink-0 text-lg text-primary/50 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </summary>
                <div className="p-6 sm:p-8">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {entry.body}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
