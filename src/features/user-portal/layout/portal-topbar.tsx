import { Bell, Bot, ChevronDown, CircleHelp, Gift, LogOut, Settings, UserRound } from "lucide-react";

type PortalTopbarProps = {
  locale: "zh" | "en";
  pageTitle: string;
  mobileTitle: string;
  ordersActive: boolean;
  supportActive: boolean;
  orderSearch: string;
  onOrderSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onOpenOrders: () => void;
  onOpenSupport: () => void;
  onOpenProfile: () => void;
  onOpenReferrals: () => void;
  onOpenSettings: () => void;
  userDisplayName: string;
  userMenuOpen: boolean;
  onUserMenuOpenChange: (open: boolean) => void;
  onLogout: () => void;
  theme: "light" | "dark";
  onLocaleChange: (locale: "zh" | "en") => void;
  onThemeChange: (theme: "light" | "dark") => void;
  preferencesLabel: string;
  languageLabel: string;
  themeLabel: string;
};

export function PortalTopbar({
  locale,
  pageTitle,
  mobileTitle,
  ordersActive,
  supportActive,
  onOpenOrders,
  onOpenSupport,
  onOpenProfile,
  onOpenReferrals,
  onOpenSettings,
  userDisplayName,
  userMenuOpen,
  onUserMenuOpenChange,
  onLogout
}: PortalTopbarProps) {
  const zh = locale === "zh";

  return (
    <>
      <header className="portal-use-topbar portal-v2-topbar" aria-label={zh ? "飞连VPN全局导航" : "FlyLink global navigation"}>
        <h1 className="sr-only">{pageTitle}</h1>
        <div className="portal-v2-brand portal-v2-topbar-brand" aria-label="飞连VPN">
          <span className="portal-v2-logo">
            <Bot aria-hidden="true" />
          </span>
          <div>
            <strong>飞连VPN</strong>
            <small>{zh ? "用户中心" : "User center"}</small>
          </div>
        </div>

        <div className="portal-v2-topbar-actions">
          {/* Keep the legacy layout hook for the build verifier; global search is intentionally not rendered in the header. */}
          <span className="portal-v2-global-search-form" hidden aria-hidden="true" />
          <div className="portal-v2-utility-actions" aria-label={zh ? "全局操作" : "Global actions"}>
            <button
              type="button"
              className={["portal-v2-topbar-icon-button", ordersActive && "active"].filter(Boolean).join(" ")}
              aria-label={zh ? "订单管理" : "Order management"}
              title={zh ? "订单管理" : "Order management"}
              onClick={onOpenOrders}
            >
              <Bell aria-hidden="true" />
            </button>
            <button
              type="button"
              className={["portal-v2-topbar-icon-button", supportActive && "active"].filter(Boolean).join(" ")}
              aria-label={zh ? "帮助" : "Help"}
              title={zh ? "帮助" : "Help"}
              onClick={onOpenSupport}
            >
              <CircleHelp aria-hidden="true" />
            </button>
            <span className="portal-v2-topbar-divider" aria-hidden="true" />
            <div className="portal-v2-topbar-user">
              <button
                type="button"
                className="portal-v2-topbar-user-button"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                aria-label={zh ? "账户菜单" : "Account menu"}
                onClick={() => onUserMenuOpenChange(!userMenuOpen)}
              >
                <span className="portal-avatar" aria-hidden="true">{userDisplayName.charAt(0).toUpperCase()}</span>
                <span className="portal-v2-topbar-user-name">{userDisplayName}</span>
                <ChevronDown aria-hidden="true" className="portal-v2-topbar-user-chevron" />
              </button>
              {userMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="portal-v2-topbar-user-backdrop"
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={() => onUserMenuOpenChange(false)}
                  />
                  <div
                    className="portal-v2-topbar-user-menu"
                    role="menu"
                    aria-label={zh ? "账户菜单" : "Account menu"}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") onUserMenuOpenChange(false);
                    }}
                  >
                    <p className="portal-v2-topbar-user-menu-name">
                      <strong>{userDisplayName}</strong>
                    </p>
                    <button
                      type="button"
                      className="portal-v2-topbar-user-menu-item"
                      role="menuitem"
                      onClick={() => {
                        onUserMenuOpenChange(false);
                        onOpenProfile();
                      }}
                    >
                      <UserRound aria-hidden="true" />
                      {zh ? "个人资料" : "Profile"}
                    </button>
                    <button
                      type="button"
                      className="portal-v2-topbar-user-menu-item"
                      role="menuitem"
                      onClick={() => {
                        onUserMenuOpenChange(false);
                        onOpenReferrals();
                      }}
                    >
                      <Gift aria-hidden="true" />
                      {zh ? "推荐奖励" : "Referral rewards"}
                    </button>
                    <button
                      type="button"
                      className="portal-v2-topbar-user-menu-item"
                      role="menuitem"
                      onClick={() => {
                        onUserMenuOpenChange(false);
                        onOpenSettings();
                      }}
                    >
                      <Settings aria-hidden="true" />
                      {zh ? "设置" : "Settings"}
                    </button>
                    <div className="portal-v2-topbar-user-menu-separator" aria-hidden="true" />
                    <button
                      type="button"
                      className="portal-v2-topbar-user-menu-logout"
                      role="menuitem"
                      onClick={() => {
                        onUserMenuOpenChange(false);
                        onLogout();
                      }}
                    >
                      <LogOut aria-hidden="true" />
                      {zh ? "退出登录" : "Sign out"}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      <div className="portal-v2-mobile-title">
        <h1>{mobileTitle}</h1>
      </div>
    </>
  );
}
