"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import { AlertTriangle, Download, Eye, FileText, Lock, Plus, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { useDirectoryStore } from "@/store/directoryStore";
import { DOCUMENT_GROUPS, documentStatus, daysUntil, type DocumentGroup, type EmployeeDocument } from "@/data/directoryData";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import type { DirectoryPerson } from "../shared";
import { Section, Empty } from "./parts";

const inputCls = "w-full rounded-[10px] border border-border/[0.14] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary-300";
const labelCls = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary";

const STATUS_STYLE: Record<string, { label: string; color: string }> = {
  valid: { label: "Valid", color: "#10B981" },
  expiring: { label: "Expiring Soon", color: "#F59E0B" },
  expired: { label: "Expired", color: "#EF4444" },
  pending: { label: "Pending", color: "#94A3B8" },
};

export function DocumentsTab({ person, canEdit }: { person: DirectoryPerson; canEdit: boolean }) {
  const { currentUser, hasPermission } = useCurrentUser();
  const allDocuments = useDirectoryStore((s) => s.documents);
  const uploadDocument = useDirectoryStore((s) => s.uploadDocument);
  const deleteDocument = useDirectoryStore((s) => s.deleteDocument);

  const documents = useMemo(() => allDocuments.filter((d) => d.employeeId === person.id), [allDocuments, person.id]);
  const isSelf = currentUser.id === person.id;
  // Private documents are only visible to the employee themselves or HR/Admin.
  const canSeePrivate = isSelf || hasPermission("employees.edit");

  const visible = useMemo(() => documents.filter((d) => (d.private ? canSeePrivate : true)), [documents, canSeePrivate]);
  const hiddenCount = documents.length - visible.length;

  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex justify-end">
          <button onClick={() => setAdding((v) => !v)} className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95">
            <Plus className="h-4 w-4" /> Upload Document
          </button>
        </div>
      ) : null}

      {adding && canEdit ? <UploadForm employeeId={person.id} onClose={() => setAdding(false)} onUpload={uploadDocument} uploaderId={currentUser.id} /> : null}

      {DOCUMENT_GROUPS.map((g) => {
        const docs = visible.filter((d) => d.group === g.id);
        return (
          <Section key={g.id} title={g.label} icon={FileText} tint={g.id === "personal" ? "#8B7CF6" : g.id === "employment" ? "#38BDF8" : "#34D399"}>
            {docs.length === 0 ? (
              <Empty>No {g.label.toLowerCase()}.</Empty>
            ) : (
              <ul className="divide-y divide-border/[0.06]">
                {docs.map((d) => (
                  <DocRow key={d.id} doc={d} canEdit={canEdit} onDelete={() => deleteDocument(d.id, currentUser.id)} />
                ))}
              </ul>
            )}
          </Section>
        );
      })}

      {hiddenCount > 0 ? (
        <p className="flex items-center justify-center gap-1.5 text-xs text-text-tertiary">
          <Lock className="h-3.5 w-3.5" /> {hiddenCount} private document{hiddenCount !== 1 ? "s" : ""} hidden — visible to the employee and HR only.
        </p>
      ) : null}
    </div>
  );
}

function DocRow({ doc, canEdit, onDelete }: { doc: EmployeeDocument; canEdit: boolean; onDelete: () => void }) {
  const status = doc.expiry ? documentStatus(doc.expiry) : doc.status;
  const st = STATUS_STYLE[status] ?? STATUS_STYLE.valid;
  const remaining = daysUntil(doc.expiry);
  const warn = status === "expiring" || status === "expired";

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface-2 text-text-tertiary">
        <FileText className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-medium text-text">
          {doc.name}
          {doc.private ? <Lock className="h-3 w-3 text-text-tertiary" /> : null}
        </p>
        <p className="truncate text-xs text-text-tertiary">
          {doc.category} · Uploaded {doc.uploadedAt}
          {doc.expiry ? ` · Expires ${doc.expiry}` : ""}
        </p>
      </div>
      {doc.expiry ? (
        <span className={cn("hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex")} style={{ color: st.color, backgroundColor: `${st.color}1F` }}>
          {warn ? <AlertTriangle className="h-3 w-3" /> : null}
          {status === "expired" ? "Expired" : status === "expiring" ? `${remaining}d left` : st.label}
        </span>
      ) : null}
      <div className="flex shrink-0 items-center gap-1">
        <IconBtn title="Preview"><Eye className="h-4 w-4" /></IconBtn>
        <IconBtn title="Download"><Download className="h-4 w-4" /></IconBtn>
        {canEdit ? (
          <>
            <IconBtn title="Replace"><RefreshCw className="h-4 w-4" /></IconBtn>
            <IconBtn title="Delete" onClick={onDelete} danger><Trash2 className="h-4 w-4" /></IconBtn>
          </>
        ) : null}
      </div>
    </li>
  );
}

function IconBtn({ children, title, onClick, danger }: { children: React.ReactNode; title: string; onClick?: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn("flex h-8 w-8 items-center justify-center rounded-[9px] text-text-tertiary transition-colors hover:bg-surface-2", danger ? "hover:text-rose-500" : "hover:text-text")}
    >
      {children}
    </button>
  );
}

function UploadForm({
  employeeId,
  onClose,
  onUpload,
  uploaderId,
}: {
  employeeId: string;
  onClose: () => void;
  onUpload: (input: { employeeId: string; name: string; group: DocumentGroup; category: string; expiry?: string; private?: boolean; uploadedById: string }) => void;
  uploaderId: string;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState<DocumentGroup>("personal");
  const [category, setCategory] = useState("");
  const [expiry, setExpiry] = useState("");
  const [priv, setPriv] = useState(false);

  const submit = () => {
    if (!name.trim()) return;
    onUpload({ employeeId, name: name.trim(), group, category: category.trim() || "General", expiry: expiry || undefined, private: priv, uploadedById: uploaderId });
    onClose();
  };

  return (
    <div className="rounded-[16px] border border-primary-200 bg-primary-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-text"><Upload className="h-4 w-4 text-primary-700" /> Upload Document</p>
        <button onClick={onClose} className="text-text-tertiary hover:text-text"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Document Name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Passport" />
        </div>
        <div>
          <label className={labelCls}>Group</label>
          <select className={inputCls} value={group} onChange={(e) => setGroup(e.target.value as DocumentGroup)}>
            {DOCUMENT_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Identity" />
        </div>
        <div>
          <label className={labelCls}>Expiry (optional)</label>
          <input type="date" className={inputCls} value={expiry} onChange={(e) => setExpiry(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-text-secondary">
          <input type="checkbox" checked={priv} onChange={(e) => setPriv(e.target.checked)} className="h-4 w-4 rounded border-border/[0.3] accent-primary-600" />
          Private (HR & employee only)
        </label>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button onClick={onClose} className="rounded-[10px] px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2">Cancel</button>
        <button onClick={submit} disabled={!name.trim()} className="rounded-[10px] bg-primary-gradient px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-40">Upload</button>
      </div>
    </div>
  );
}
