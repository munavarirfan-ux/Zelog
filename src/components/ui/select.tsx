"use client";

import * as React from "react";
import MuiSelect from "@mui/material/Select";
import MuiMenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (v: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({ value: "", onValueChange: () => {} });

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

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      {children}
    </SelectContext.Provider>
  );
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext);
  return <span className="truncate">{value || placeholder || ""}</span>;
}

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

const SelectTriggerContext = React.createContext<{
  items: { value: string; label: React.ReactNode }[];
  setItems: (items: { value: string; label: React.ReactNode }[]) => void;
}>({ items: [], setItems: () => {} });

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children }, ref) => {
    const { value, onValueChange } = React.useContext(SelectContext);
    const [items, setItems] = React.useState<{ value: string; label: React.ReactNode }[]>([]);

    return (
      <SelectTriggerContext.Provider value={{ items, setItems }}>
        <FormControl size="small" fullWidth ref={ref}>
          <MuiSelect
            value={value}
            onChange={(e) => onValueChange(e.target.value as string)}
            displayEmpty
            IconComponent={() => <ChevronDown className="mr-2 h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={2} />}
            className={cn("!rounded-[10px] !text-sm !font-medium", className)}
            renderValue={() => children}
            MenuProps={{
              slotProps: {
                paper: {
                  className: "!rounded-[14px] !border !border-border/[0.07] !bg-surface !shadow-float dark:!border-white/[0.06] !mt-1",
                  sx: { backgroundImage: "none" },
                },
                list: { className: "!p-1" },
              },
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--border-rgb) / 0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--primary-300-rgb) / 0.4)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "rgb(var(--primary-500-rgb) / 0.6)", borderWidth: "2px" },
              "& .MuiSelect-select": { color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" },
              backgroundColor: "rgb(var(--primary-50-rgb) / 0.4)",
            }}
          >
            {items.map((item) => (
              <MuiMenuItem
                key={item.value}
                value={item.value}
                className="!rounded-[8px] !mx-1 !px-2 !py-1.5 !text-sm !text-text hover:!bg-surface-2"
                sx={{ minHeight: "unset" }}
              >
                {item.label}
              </MuiMenuItem>
            ))}
          </MuiSelect>
        </FormControl>
      </SelectTriggerContext.Provider>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

function SelectContent({ children }: { children: React.ReactNode; className?: string }) {
  const { setItems } = React.useContext(SelectTriggerContext);

  React.useEffect(() => {
    const items: { value: string; label: React.ReactNode }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value !== undefined) {
        items.push({ value: child.props.value, label: child.props.children });
      }
    });
    setItems(items);
  }, [children, setItems]);

  return null;
}

function SelectItem({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  return null;
}

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem };
