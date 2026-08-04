"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  mappedMembers: number;
  activeMappedMembers: number;
  activeContributors: number;
  inactiveContributors: number;
  status: "active" | "inactive";
}

const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "Aqua Exchange", mappedMembers: 17, activeMappedMembers: 11, activeContributors: 10, inactiveContributors: 6, status: "active" },
  { id: "c2", name: "Arealytics", mappedMembers: 41, activeMappedMembers: 40, activeContributors: 40, inactiveContributors: 1, status: "active" },
  { id: "c3", name: "Cambridge Systematics", mappedMembers: 18, activeMappedMembers: 15, activeContributors: 15, inactiveContributors: 3, status: "active" },
  { id: "c4", name: "DataBeat", mappedMembers: 2, activeMappedMembers: 1, activeContributors: 1, inactiveContributors: 1, status: "active" },
  { id: "c5", name: "Domino", mappedMembers: 9, activeMappedMembers: 6, activeContributors: 6, inactiveContributors: 3, status: "active" },
  { id: "c6", name: "EDZE SOFT", mappedMembers: 14, activeMappedMembers: 12, activeContributors: 9, inactiveContributors: 2, status: "active" },
  { id: "c7", name: "Empirical CRE", mappedMembers: 6, activeMappedMembers: 4, activeContributors: 4, inactiveContributors: 2, status: "active" },
  { id: "c8", name: "Hatch", mappedMembers: 11, activeMappedMembers: 11, activeContributors: 9, inactiveContributors: 0, status: "active" },
  { id: "c9", name: "Micare health Holdings", mappedMembers: 6, activeMappedMembers: 6, activeContributors: 5, inactiveContributors: 0, status: "active" },
  { id: "c10", name: "MoiTele", mappedMembers: 8, activeMappedMembers: 3, activeContributors: 3, inactiveContributors: 5, status: "active" },
  { id: "c11", name: "NDL", mappedMembers: 5, activeMappedMembers: 2, activeContributors: 0, inactiveContributors: 3, status: "inactive" },
  { id: "c12", name: "Profitcs", mappedMembers: 7, activeMappedMembers: 5, activeContributors: 3, inactiveContributors: 2, status: "active" },
];

const GRID = "grid-cols-[minmax(160px,1.6fr)_repeat(4,minmax(110px,1fr))_64px]";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [newClient, setNewClient] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = clients;
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    return result;
  }, [clients, statusFilter, search]);

  function handleAddClient() {
    const name = newClient.trim();
    if (!name) return;
    setClients((prev) => [
      { id: `c_${prev.length + 1}_${name}`, name, mappedMembers: 0, activeMappedMembers: 0, activeContributors: 0, inactiveContributors: 0, status: "active" },
      ...prev,
    ]);
    setNewClient("");
    setAddOpen(false);
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Hero card */}
      <section className="relative overflow-hidden rounded-shell bg-hero px-6 py-7 text-white shadow-[0_20px_60px_-20px_rgba(49,46,129,0.5)] sm:px-10 sm:py-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
            <p className="mt-0.5 text-sm text-white/60">Manage clients and their mapped members</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button variant="white" size="lg" className="gap-2">
                <Plus className="h-4 w-4" /> Add new client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
              <DialogHeader>
                <DialogTitle>Add new client</DialogTitle>
                <DialogDescription className="sr-only">Create a new client.</DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                <label className="mb-1.5 block text-xs font-medium text-text-secondary">Client name</label>
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddClient(); }}
                  placeholder="e.g. Acme Corp"
                  autoFocus
                  className="h-11 w-full rounded-[10px] border border-border/10 bg-surface-2/50 px-3 text-sm text-text placeholder:text-text-tertiary focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button disabled={!newClient.trim()} onClick={handleAddClient}>Add client</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Toolbar strip */}
      <div className="rounded-card border border-border/[0.07] bg-surface px-4 py-3 shadow-card dark:border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-40 shrink-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name"
              className="h-10 w-full rounded-[10px] border border-border/10 bg-surface-2/60 pl-9 pr-3 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Clients table card */}
      <div className="rounded-card border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06] overflow-x-auto">
        <div className="min-w-[720px]">
        {/* Table header */}
        <div className={cn("grid min-h-[44px] items-center gap-3 rounded-t-card bg-[#F3F0FF] px-6 py-2 text-[11px] font-semibold uppercase leading-tight tracking-wider text-text-secondary dark:bg-accent/[0.08]", GRID)}>
          <span>Name</span>
          <span className="text-center">Mapped Members</span>
          <span className="text-center">Active Mapped Members</span>
          <span className="text-center">Active Contributors</span>
          <span className="text-center">Inactive Contributors</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {filtered.length ? filtered.map((client) => (
            <div key={client.id} className={cn("group grid h-14 items-center gap-3 px-6 transition-colors duration-150 hover:bg-accent/[0.03] dark:hover:bg-accent/[0.05]", GRID)}>
              <span className="truncate text-sm font-medium text-text">{client.name}</span>
              <span className="text-center text-sm tabular-nums text-text-secondary">{client.mappedMembers}</span>
              <span className="text-center text-sm tabular-nums text-text-secondary">{client.activeMappedMembers}</span>
              <span className="text-center text-sm tabular-nums text-text-secondary">{client.activeContributors}</span>
              <span className="text-center text-sm tabular-nums text-text-secondary">{client.inactiveContributors}</span>
              <div className="flex items-center justify-end gap-0.5">
                <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Edit client">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="More actions">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Pencil className="h-4 w-4" /> Edit client</DropdownMenuItem>
                    <DropdownMenuItem><Users className="h-4 w-4" /> View members</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive><Trash2 className="h-4 w-4" /> Delete client</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )) : (
            <div className="flex h-32 items-center justify-center text-sm text-text-tertiary">
              No clients match your filters.
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
