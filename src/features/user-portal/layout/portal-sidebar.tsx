import { Fragment } from "react";
import { ChevronRight, LogOut, type LucideIcon } from "lucide-react";
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

type PortalSidebarOrderCategory<TFilter extends string> = {
  id: TFilter;
  label: string;
};

export type PortalSidebarProps<TView extends string, TFilter extends string> = {
  locale: "zh" | "en";
  groups: readonly PortalSidebarGroup<TView>[];
  activeView: TView;
  orderCenterFilter: TFilter;
  orderCategories: readonly PortalSidebarOrderCategory<TFilter>[];
  showOrderCategories: boolean;
  desktopOrderNavigation: boolean;
  userDisplayName: string;
  walletBalance: number | null;
  onNavigate: (view: TView) => void;
  onNavigateOrderFilter: (filter: TFilter) => void;
  onLogout: () => void;
};

export function PortalSidebar<TView extends string, TFilter extends string>({
  locale,
  groups,
  activeView,
  orderCenterFilter,
  orderCategories,
  showOrderCategories,
  desktopOrderNavigation,
  userDisplayName,
  walletBalance,
  onNavigate,
  onNavigateOrderFilter,
  onLogout
}: PortalSidebarProps<TView, TFilter>) {
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
              const hasOrderCategories = showOrderCategories && item.id === ("orders" as TView);
              const hasOrderDisclosure = hasOrderCategories && desktopOrderNavigation;
              const orderCategoriesExpanded = hasOrderDisclosure && activeView === ("orders" as TView);
              const current = activeView === item.id
                && (!hasOrderDisclosure || orderCenterFilter === ("all" as TFilter));

              return (
                <Fragment key={item.id}>
                  <button
                    type="button"
                    aria-label={item.label}
                    aria-describedby={item.id === ("wallet" as TView) ? "portal-wallet-nav-balance" : undefined}
                    aria-current={current ? "page" : undefined}
                    aria-expanded={hasOrderDisclosure ? orderCategoriesExpanded : undefined}
                    aria-controls={hasOrderDisclosure ? "portal-order-categories" : undefined}
                    data-portal-view={item.id}
                    className={cn("portal-use-nav-item", current && "active", hasOrderCategories && "portal-order-nav-parent")}
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
                    {hasOrderCategories ? <ChevronRight className="portal-order-nav-chevron" aria-hidden="true" /> : null}
                  </button>
                  {hasOrderCategories ? (
                    <div
                      id="portal-order-categories"
                      className="portal-order-subnav"
                      role="group"
                      aria-label={zh ? "订单分类" : "Order categories"}
                      hidden={!orderCategoriesExpanded}
                    >
                      {orderCategories.map((category) => {
                        const categoryCurrent = orderCategoriesExpanded && orderCenterFilter === category.id;
                        return (
                          <button
                            key={category.id}
                            type="button"
                            className={cn("portal-use-nav-item portal-order-nav-child", categoryCurrent && "active")}
                            aria-label={category.label}
                            aria-current={categoryCurrent ? "page" : undefined}
                            onClick={() => onNavigateOrderFilter(category.id)}
                          >
                            <span><strong>{category.label}</strong></span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="portal-user-card portal-v2-user-card portal-v2-account-card">
        <span className="portal-avatar">{userDisplayName.charAt(0).toUpperCase()}</span>
        <div>
          <strong>{userDisplayName}</strong>
          <small>{zh ? "邮箱：" : "Email: "}{userDisplayName}</small>
        </div>
        <button
          type="button"
          className="portal-logout-button portal-v2-account-logout"
          aria-label={zh ? "退出登录" : "Sign out"}
          onClick={onLogout}
        >
          <LogOut aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
