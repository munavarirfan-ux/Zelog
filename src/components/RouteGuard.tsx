"use client";

import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { isHrefAllowedForRole } from "@/config/nav";
import { Unauthorized } from "@/components/Unauthorized";

/**
 * Centralized route guard driven by the navigation config. Blocks any pathname
 * the active role/permission set isn't allowed to reach — so hiding a nav item
 * isn't the only line of defense against typing a restricted URL directly.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeRole, permissions } = useCurrentUser();

  if (!isHrefAllowedForRole(activeRole, pathname, permissions)) {
    return <Unauthorized />;
  }
  return <>{children}</>;
}
