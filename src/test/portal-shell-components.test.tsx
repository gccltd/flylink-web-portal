import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { LayoutGrid, ReceiptText, ShoppingBag, WalletCards, Wifi } from "lucide-react";
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

  test("renders exactly five primary navigation entries without account actions", () => {
    const onNavigate = vi.fn();
    render(
      <PortalSidebar
        locale="zh"
        groups={[{
          id: "primary",
          label: "主导航",
          items: [
            { id: "dashboard", label: "概览", description: "账户总览", icon: LayoutGrid },
            { id: "marketplace", label: "套餐商城", description: "浏览套餐", icon: ShoppingBag },
            { id: "orders", label: "我的订单", description: "查看订单", icon: ReceiptText },
            { id: "wallet", label: "钱包余额", description: "Coins 余额", icon: WalletCards },
            { id: "start", label: "使用指南", description: "客户端连接步骤", icon: Wifi }
          ]
        }]}
        activeView="orders"
        onNavigate={onNavigate}
      />
    );

    const navigation = screen.getByRole("navigation", { name: "用户中心导航" });
    expect(within(navigation).getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "我的订单" }).getAttribute("aria-current")).toBe("page");
    expect(screen.queryByRole("button", { name: "个人资料" })).toBeNull();
    expect(screen.queryByRole("button", { name: "退出登录" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "概览" }));
    expect(onNavigate).toHaveBeenCalledWith("dashboard");
  });

  test("keeps search, help, account destinations, and logout connected to their owners", () => {
    const onSearchSubmit = vi.fn();
    const onOrderSearchChange = vi.fn();
    const onOpenSupport = vi.fn();
    const onOpenProfile = vi.fn();
    const onOpenReferrals = vi.fn();
    const onOpenSettings = vi.fn();
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
        onOpenProfile={onOpenProfile}
        onOpenReferrals={onOpenReferrals}
        onOpenSettings={onOpenSettings}
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

    fireEvent.click(screen.getByRole("menuitem", { name: "个人资料" }));
    expect(onUserMenuOpenChange).toHaveBeenLastCalledWith(false);
    expect(onOpenProfile).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "推荐奖励" }));
    expect(onOpenReferrals).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "设置" }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("menuitem", { name: "退出登录" }));
    expect(onUserMenuOpenChange).toHaveBeenLastCalledWith(false);
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
