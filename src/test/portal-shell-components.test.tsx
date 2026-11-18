import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { LayoutGrid, ReceiptText, WalletCards } from "lucide-react";
import { PortalAppShell } from "../features/user-portal/layout/portal-app-shell";
import { PortalSidebar } from "../features/user-portal/layout/portal-sidebar";
import { PortalTopbar } from "../features/user-portal/layout/portal-topbar";

afterEach(() => cleanup());

describe("Portal desktop shell components", () => {
  test("composes the sidebar and main content without changing the theme contract", () => {
    render(
      <PortalAppShell
        theme="dark"
        sidebar={<aside aria-label="sidebar">Navigation</aside>}
        mainClassName="portal-v2-main-payment"
      >
        <h1>Account overview</h1>
      </PortalAppShell>
    );

    expect(document.querySelector(".portal-v2-shell")?.getAttribute("data-portal-theme")).toBe("dark");
    expect(screen.getByLabelText("sidebar")).toBeTruthy();
    expect(screen.getByRole("main").className).toContain("portal-v2-main-payment");
    expect(screen.getByRole("heading", { name: "Account overview" })).toBeTruthy();
  });

  test("renders active navigation and the selected order category", () => {
    const onNavigate = vi.fn();
    const onNavigateOrderFilter = vi.fn();
    render(
      <PortalSidebar
        locale="zh"
        groups={[{
          id: "service",
          label: "服务",
          items: [
            { id: "dashboard", label: "概览", description: "账户总览", icon: LayoutGrid },
            { id: "orders", label: "订单管理", description: "查看订单", icon: ReceiptText },
            { id: "wallet", label: "钱包", description: "Coins 余额", icon: WalletCards }
          ]
        }]}
        activeView="orders"
        orderCenterFilter="coin_recharge"
        orderCategories={[
          { id: "coins_consumption", label: "商城消费" },
          { id: "coin_recharge", label: "充值订单" }
        ]}
        showOrderCategories
        desktopOrderNavigation
        userDisplayName="Yi"
        walletBalance={70}
        onNavigate={onNavigate}
        onNavigateOrderFilter={onNavigateOrderFilter}
        onLogout={vi.fn()}
      />
    );

    expect(screen.getByRole("navigation", { name: "用户中心导航" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "充值订单" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "概览" }));
    expect(onNavigate).toHaveBeenCalledWith("dashboard");
    fireEvent.click(screen.getByRole("button", { name: "商城消费" }));
    expect(onNavigateOrderFilter).toHaveBeenCalledWith("coins_consumption");
  });

  test("keeps search, help, and account-menu actions connected to their owners", () => {
    const onSearchSubmit = vi.fn();
    const onOrderSearchChange = vi.fn();
    const onOpenSupport = vi.fn();
    const onUserMenuOpenChange = vi.fn();
    const onLogout = vi.fn();

    render(
      <PortalTopbar
        locale="zh"
        pageTitle="账户概览"
        mobileTitle="概览"
        ordersActive={false}
        supportActive={false}
        orderSearch=""
        onOrderSearchChange={onOrderSearchChange}
        onSearchSubmit={onSearchSubmit}
        onOpenOrders={vi.fn()}
        onOpenSupport={onOpenSupport}
        userDisplayName="Yi"
        userMenuOpen
        onUserMenuOpenChange={onUserMenuOpenChange}
        onLogout={onLogout}
        theme="dark"
        onLocaleChange={vi.fn()}
        onThemeChange={vi.fn()}
        preferencesLabel="显示偏好"
        languageLabel="语言"
        themeLabel="主题"
      />
    );

    expect(screen.getByRole("heading", { name: "账户概览" })).toBeTruthy();
    fireEvent.change(screen.getByRole("searchbox", { name: "订单搜索" }), { target: { value: "FL-1001" } });
    expect(onOrderSearchChange).toHaveBeenCalledWith("FL-1001");
    fireEvent.submit(screen.getByRole("searchbox", { name: "订单搜索" }).closest("form")!);
    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "帮助" }));
    expect(onOpenSupport).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "退出登录" }));
    expect(onUserMenuOpenChange).toHaveBeenCalledWith(false);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
