import { PageContainer } from "@/components/PageContainer";

interface PagePlaceholderProps {
  title: string;
  /** Short line under the title inside the hero. */
  subtitle?: string;
  /** Body message describing what's coming. */
  message?: string;
}

/**
 * Clean placeholder for modules not yet implemented, using the shared Ze[flow]
 * hero header. No fake functionality — just a titled surface and a note.
 */
export function PagePlaceholder({ title, subtitle, message }: PagePlaceholderProps) {
  return (
    <PageContainer>
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-sm text-white/60">{subtitle}</p> : null}
        </div>
      </section>

      <div className="rounded-card border border-border/[0.07] bg-surface px-6 py-16 text-center shadow-card dark:border-white/[0.06]">
        <p className="text-sm text-text-secondary">
          {message ?? `${title} will be implemented in the next phase.`}
        </p>
      </div>
    </PageContainer>
  );
}
