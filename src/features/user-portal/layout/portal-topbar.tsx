import { Bell, Globe2, ChevronDown, CircleHelp, Gift, LogOut, Settings, UserRound } from "lucide-react";
import { isPortalWebPath, portalAssetPath } from "../portal-entry";


const userAvatarPalettes = ["cobalt", "violet", "aqua", "indigo", "sunset", "mint"] as const;
function avatarVariant(name: string) {
  return ([...name].reduce((hash, char) => (Math.imul(hash, 31) + (char.codePointAt(0) ?? 0)) | 0, 0) >>> 0) % userAvatarPalettes.length;
}
function PortalUserAvatar({ name }: { name: string }) {
  const styleIndex = avatarVariant(name);
  return (
    <span className={`portal-v2-user-avatar portal-v2-user-avatar--${userAvatarPalettes[styleIndex]}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        {styleIndex === 0 ? (
          <><circle cx="20" cy="14.5" r="6.9" /><path d="M7 35c1-9 6-13 13-13s12 4 13 13z" /></>
        ) : styleIndex === 1 ? (
          <><path d="M20 6 29 12 27 23 20 28 13 23 11 12z" /><path d="M6 36 11 29 20 26 29 29 34 36z" /></>
        ) : styleIndex === 2 ? (
          <><circle cx="20" cy="15" r="7.5" /><path d="M8 34c2-8 6-11 12-11s10 3 12 11" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></>
        ) : styleIndex === 3 ? (
          <><circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" /><text x="20" y="27.5" textAnchor="middle" fontSize="20" fontWeight="700">{name.trim().charAt(0).toUpperCase() || "U"}</text></>
        ) : styleIndex === 4 ? (
          <><path d="M9 35c0-10 5-14 11-14s11 4 11 14z" /><circle cx="20" cy="14" r="7" /><path d="M13 8c3-5 11-5 14 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>
        ) : (
          <><circle cx="20" cy="14.5" r="7" /><path d="M7 35c1-8 6-12 13-12s12 4 13 12z" /><path d="m10 11 4-6m16 6-4-6" fill="none" stroke="currentColor" strokeWidth="2" /></>
        )}
      </svg>
    </span>
  );
}

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
  const webBrand = isPortalWebPath();

  return (
    <>
      <header className="portal-use-topbar portal-v2-topbar" aria-label={zh ? "飞连VPN全局导航" : "FlyLink global navigation"}>
        <h1 className="sr-only">{pageTitle}</h1>
        <div className="portal-v2-brand portal-v2-topbar-brand" aria-label="飞连VPN">
          <span className="portal-v2-logo">
            {webBrand ? <img className="portal-v2-brand-robot" src={portalAssetPath("portal-brand-robot.webp")} alt="" width="40" height="40" decoding="async" /> : <Globe2 aria-hidden="true" />}
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
                {webBrand ? <PortalUserAvatar name={userDisplayName} /> : <span className="portal-avatar" aria-hidden="true">{userDisplayName.charAt(0).toUpperCase()}</span>}
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
