import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../../shared/public/utils";
import { isPortalWebPath, portalAssetPath } from "../portal-entry";

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
  const webBrand = isPortalWebPath();

  return (
    <aside className="portal-use-sidebar portal-v2-sidebar">
      {webBrand ? (
        <div className="portal-sidebar-brand" aria-label={zh ? "飞连VPN品牌" : "FlyLink VPN brand"}>
          <img src={portalAssetPath("portal-sidebar-mascot.webp")} width="44" height="44" alt="" decoding="async" />
          <span>
            <strong>飞连VPN</strong>
            <small>{zh ? "用户中心" : "User center"}</small>
          </span>
        </div>
      ) : null}
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
      {webBrand ? (
        <div className="portal-sidebar-scene" aria-hidden="true">
          <span className="portal-sidebar-scene__halo" />
          <img
            className="portal-sidebar-scene__robot"
            src={portalAssetPath("portal-sidebar-mascot.webp")}
            width="480"
            height="480"
            loading="lazy"
            decoding="async"
            alt=""
          />
          <span className="portal-sidebar-scene__orbit" />
          <span className="portal-sidebar-scene__platform" />
          <span className="portal-sidebar-scene__caption">FlyLink · VPN</span>
        </div>
      ) : null}
    </aside>
  );
}
