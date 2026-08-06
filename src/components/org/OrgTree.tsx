"use client";

import { getDescendantIds, type Employee, type EmployeeNode } from "@/data/orgData";
import { EmployeeNodeCard } from "./EmployeeNodeCard";

interface OrgTreeProps {
  roots: EmployeeNode[];
  employees: Employee[];
  collapsedIds: Set<string>;
  visibleIds: Set<string> | null;
  selectedId: string | null;
  highlightId: string | null;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
}

export function OrgTree({
  roots,
  employees,
  collapsedIds,
  visibleIds,
  selectedId,
  highlightId,
  onSelect,
  onToggleCollapse,
}: OrgTreeProps) {
  function renderLevel(nodes: EmployeeNode[], depth: number) {
    const visible = nodes.filter((n) => !visibleIds || visibleIds.has(n.id));
    if (!visible.length) return null;

    return (
      <ul className={depth === 0 ? "org-tree" : undefined}>
        {visible.map((node) => {
          const directReports = node.children.length;
          const hiddenCount = getDescendantIds(employees, node.id).length;
          const collapsed = collapsedIds.has(node.id);
          const visibleChildren = node.children.filter((c) => !visibleIds || visibleIds.has(c.id));
          const showChildren = !collapsed && visibleChildren.length > 0;

          return (
            <li key={node.id}>
              <EmployeeNodeCard
                node={node}
                directReports={directReports}
                hiddenCount={hiddenCount}
                collapsed={collapsed && directReports > 0}
                selected={selectedId === node.id}
                highlighted={highlightId === node.id}
                onSelect={() => onSelect(node.id)}
                onToggleCollapse={() => onToggleCollapse(node.id)}
              />
              {showChildren ? renderLevel(node.children, depth + 1) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  return renderLevel(roots, 0);
}
