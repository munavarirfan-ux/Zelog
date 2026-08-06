"use client";

import { useRef, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { CalendarDays, Plus, Trash2, Upload } from "lucide-react";
import { useHolidayStore } from "@/store/holidayStore";

export function HolidaysPanel({ canManage }: { canManage: boolean }) {
  const holidays = useHolidayStore((s) => s.holidays);
  const addHoliday = useHolidayStore((s) => s.addHoliday);
  const removeHoliday = useHolidayStore((s) => s.removeHoliday);
  const importCsv = useHolidayStore((s) => s.importCsv);

  const [date, setDate] = useState<Date | null>(null);
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleAdd() {
    if (!date || !name.trim()) return;
    addHoliday(format(date, "yyyy-MM-dd"), name.trim());
    toast.success("Holiday added");
    setDate(null);
    setName("");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const count = importCsv(String(reader.result || ""));
      toast[count ? "success" : "error"](count ? `Imported ${count} holiday${count === 1 ? "" : "s"}` : "No valid rows found");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-border/[0.06] bg-surface px-4 py-3 shadow-xs dark:border-white/[0.06]">
            <DatePicker label="Date" value={date} onChange={setDate} slotProps={{ textField: { size: "small", sx: { width: 170 } } }} />
            <TextField label="Holiday name" size="small" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
            <button
              type="button"
              onClick={handleAdd}
              disabled={!date || !name.trim()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-primary-gradient px-3.5 text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" /> Add holiday
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border/10 px-3 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-2 dark:border-white/10"
            >
              <Upload className="h-3.5 w-3.5" /> Upload CSV
            </button>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <span className="w-full text-[11px] text-text-tertiary">CSV format: one holiday per line — <code>YYYY-MM-DD,Holiday name</code></span>
          </div>
        </LocalizationProvider>
      )}

      <div className="overflow-hidden rounded-[16px] border border-border/[0.07] bg-surface shadow-card dark:border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-border/[0.06] px-5 py-3 dark:border-white/[0.05]">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-text">
            <CalendarDays className="h-4 w-4 text-primary-500" /> Company holidays
          </h3>
          <span className="text-xs text-text-tertiary">{holidays.length} holidays</span>
        </div>
        <div className="grid grid-cols-[140px_120px_1fr_44px] items-center gap-3 border-b border-border/[0.06] bg-[#F3F0FF] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-secondary dark:bg-white/[0.04] dark:border-white/[0.05]">
          <span>Date</span>
          <span>Day</span>
          <span>Holiday</span>
          <span />
        </div>
        <div className="divide-y divide-border/[0.06] dark:divide-white/[0.05]">
          {holidays.length === 0 && <p className="px-5 py-8 text-center text-sm text-text-tertiary">No holidays configured.</p>}
          {holidays.map((h) => (
            <div key={h.date} className="grid grid-cols-[140px_120px_1fr_44px] items-center gap-3 px-5 py-3 transition-colors hover:bg-[rgba(99,102,241,0.03)]">
              <span className="text-sm font-medium tabular-nums text-text">{format(parseISO(h.date), "MMM d, yyyy")}</span>
              <span className="text-sm text-text-secondary">{format(parseISO(h.date), "EEEE")}</span>
              <span className="text-sm text-text-secondary">{h.name}</span>
              {canManage ? (
                <button
                  type="button"
                  onClick={() => { removeHoliday(h.date); toast.success("Holiday removed"); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-danger/10 hover:text-danger"
                  aria-label={`Remove ${h.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
