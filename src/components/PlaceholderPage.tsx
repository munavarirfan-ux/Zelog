import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">{title}</h1>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-text-secondary">
          This section isn&apos;t part of the Tracker redesign yet — check back soon.
        </CardContent>
      </Card>
    </div>
  );
}
