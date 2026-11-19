import type { ReactNode } from "react";
import { isPortalWebPath } from "../portal-entry";

type PortalAppShellProps = {
  children: ReactNode;
  mainClassName?: string;
  sidebar: ReactNode;
  theme: "light" | "dark";
};

export function PortalAppShell({
  children,
  mainClassName,
  sidebar,
  theme
}: PortalAppShellProps) {
  return (
    <div className={["portal-use-shell", "portal-v2-shell", isPortalWebPath() && "portal-v2-shell--web", mainClassName === "portal-v2-main-payment" && "portal-v2-shell-payment"].filter(Boolean).join(" ")} data-portal-theme={theme}>
      {sidebar}
      <main className={["portal-use-main portal-v2-main", mainClassName].filter(Boolean).join(" ")}>
        {children}
      </main>
    </div>
  );
}
