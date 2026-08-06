import { Contact } from "lucide-react";
import { ModulePlaceholder } from "@/components/ModulePlaceholder";

export default function DirectoryPage() {
  return (
    <ModulePlaceholder
      title="Directory"
      description="Browse the company employee directory."
      icon={Contact}
      features={[
        { title: "People", description: "Searchable list of everyone in the organization." },
        { title: "Profiles", description: "Roles, contact details, and reporting lines." },
        { title: "Filters", description: "Filter by department, team, location, or status." },
      ]}
    />
  );
}
