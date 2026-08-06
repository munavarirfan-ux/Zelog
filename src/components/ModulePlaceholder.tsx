import type { LucideIcon } from "lucide-react";

interface ModuleFeature {
  title: string;
  description: string;
}

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: ModuleFeature[];
}

export function ModulePlaceholder({ title, description, icon: Icon, features }: ModulePlaceholderProps) {
  return (
    <div className="space-y-5 pb-12">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.14] backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-0.5 text-sm text-white/60">{description}</p>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-card border border-border/[0.07] bg-surface p-5 shadow-card dark:border-white/[0.06]"
          >
            <h3 className="text-sm font-semibold text-text">{feature.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{feature.description}</p>
            <span className="mt-4 inline-flex items-center rounded-full bg-primary-100/60 px-2.5 py-1 text-[11px] font-medium text-primary-600 dark:bg-primary-100/40">
              Coming soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
