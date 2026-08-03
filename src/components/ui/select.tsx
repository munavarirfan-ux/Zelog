"use client";

import * as React from "react";
import MuiSelect from "@mui/material/Select";
import MuiMenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectItemData {
  value: string;
  label: React.ReactNode;
}

interface SelectContextValue {
  value: string;
  onValueChange: (v: string) => void;
  items: SelectItemData[];
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "",
  onValueChange: () => {},
  items: [],
});

// Recursively walk the children tree and collect every <SelectItem value=…> so the
// trigger has its options synchronously on first render (avoids MUI out-of-range warnings).
function collectItems(children: React.ReactNode, acc: SelectItemData[]) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as { value?: string; children?: React.ReactNode };
    if (props.value !== undefined) {
      acc.push({ value: props.value, label: props.children });
    } else if (props.children) {
      collectItems(props.children, acc);
    }
  });
}

function Select({ value, onValueChange, defaultValue, children }: {
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = React.useCallback((v: string) => {
    if (!isControlled) setInternalValue(v);
    onValueChange?.(v);
  }, [isControlled, onValueChange]);

  const items = React.useMemo(() => {
    const acc: SelectItemData[] = [];
    collectItems(children, acc);
    return acc;
  }, [children]);

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange, items }}>
      {children}
    </SelectContext.Provider>
  );
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, items } = React.useContext(SelectContext);
  const selected = items.find((i) => i.value === value);
  if (selected) return <span className="truncate">{selected.label}</span>;
  return <span className="truncate text-text-tertiary">{placeholder || ""}</span>;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children }, ref) => {
    const { value, onValueChange, items } = React.useContext(SelectContext);

    return (
      <FormControl size="small" fullWidth ref={ref}>
        <MuiSelect
          value={value}
          onChange={(e) => onValueChange(e.target.value as string)}
          displayEmpty
          IconComponent={() => <ChevronDown className="mr-3 h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={2} />}
          className={cn("!h-10 !rounded-[10px] !text-sm !font-medium", className)}
          renderValue={() => children}
          MenuProps={{
            slotProps: {
              paper: {
                className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06] !mt-1.5",
                sx: { backgroundImage: "none", minWidth: 180 },
              },
              list: { className: "!p-1" },
            },
          }}
          sx={{
            "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--border-rgb) / 0.12)" },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--primary-300-rgb) / 0.5)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--primary-500-rgb) / 0.6)", borderWidth: "2px" },
            "& .MuiSelect-select": {
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingLeft: "0.875rem",
            },
            backgroundColor: "rgb(var(--surface-2-rgb) / 0.6)",
          }}
        >
          {items.map((item) => (
            <MuiMenuItem
              key={item.value}
              value={item.value}
              className="!mx-1 !rounded-[8px] !px-2 !py-1.5 !text-sm !text-text hover:!bg-surface-2"
              sx={{
                minHeight: "unset",
                "&.Mui-selected": { backgroundColor: "rgb(var(--primary-100-rgb) / 0.6)" },
                "&.Mui-selected:hover": { backgroundColor: "rgb(var(--primary-100-rgb) / 0.8)" },
              }}
            >
              {item.label}
            </MuiMenuItem>
          ))}
        </MuiSelect>
      </FormControl>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

// SelectContent / SelectItem are declarative markers — the actual options are
// collected from the tree by <Select>. They render nothing themselves.
function SelectContent({ children }: { children: React.ReactNode; className?: string }) {
  return null;
}

function SelectItem({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  return null;
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
