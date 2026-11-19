import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/public/utils";

type PortalSidebarItem<TView extends string> = {
  id: TView;
  label: string;
  description: string;
  icon: LucideIcon;
};

type PortalSidebarGroup<TView extends string> = {
  id: string;
  label: string;
  items: readonly PortalSidebarItem<TView>[];
};

export type PortalSidebarProps<TView extends string> = {
  locale: "zh" | "en";
  groups: readonly PortalSidebarGroup<TView>[];
  activeView: TView;
  walletBalance: number | null;
  onNavigate: (view: TView) => void;
};

export function PortalSidebar<TView extends string>({
  locale,
  groups,
  activeView,
  walletBalance,
  onNavigate
}: PortalSidebarProps<TView>) {
  const zh = locale === "zh";

  return (
    <aside className="portal-use-sidebar portal-v2-sidebar">
      <nav
        className="portal-use-nav"
        aria-label={zh ? "用户中心导航" : "User center navigation"}
      >
        {groups.map((group) => (
          <div
            key={group.id}
            className="portal-nav-group"
            data-portal-nav-group={group.id}
            role="group"
            aria-labelledby={`portal-nav-group-${group.id}`}
          >
            <span className="portal-nav-group-label" id={`portal-nav-group-${group.id}`}>
              {group.label}
            </span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const current = activeView === item.id;

              return (
                <Fragment key={item.id}>
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-current={current ? "page" : undefined}
                    aria-describedby={item.id === ("wallet" as TView) ? "portal-wallet-nav-balance" : undefined}
                    data-portal-view={item.id}
                    className={cn("portal-use-nav-item", current && "active")}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    {item.id === ("wallet" as TView) ? (
                      <span className="sr-only" id="portal-wallet-nav-balance">
                        Coins · {walletBalance ?? "--"}
                      </span>
                    ) : null}
                  </button>
                </Fragment>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
