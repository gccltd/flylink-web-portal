import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardRecentOrders } from "../features/user-portal/dashboard/dashboard-recent-orders";
import { DashboardWalletCard } from "../features/user-portal/dashboard/dashboard-wallet-card";
import { DashboardStartCard } from "../features/user-portal/dashboard/dashboard-start-card";
import { PortalSidebar } from "../features/user-portal/layout/portal-sidebar";
import { Gift, LayoutDashboard } from "lucide-react";
import { MarketplaceOfferCard } from "../features/user-portal/marketplace-offer-card";
import { presentDashboardRecentOrders } from "../features/user-portal/dashboard/dashboard-recent-orders-model";

afterEach(() => cleanup());

describe("Portal Dashboard components", () => {
  test("keeps recent-order actions routed to Orders regardless of viewport layout", () => {
    const onOpenOrders = vi.fn();

    render(
      <DashboardRecentOrders
        locale="zh"
        orders={[{
          key: "service_access:service-1",
          orderNumber: "FL-1001",
          productLabel: "年度套餐",
          kindLabel: "服务记录",
          createdAtLabel: "11/18 10:00",
          amountLabel: null,
          amountDetail: null,
          status: "active",
          statusLabel: "已完成"
        }]}
        phase="ready"
        retryable={false}
        onRetry={vi.fn()}
        onOpenOrders={onOpenOrders}
      />
    );

    expect(screen.getByRole("button", { name: /FL-1001/ })).toBeTruthy();
    expect(screen.getByText("年度套餐")).toBeTruthy();
    expect(screen.queryByText(/Coins/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
    fireEvent.click(screen.getByRole("button", { name: /FL-1001/ }));
    expect(onOpenOrders).toHaveBeenCalledTimes(2);
  });


  test("shows at most three recent activity rows and keeps full Orders navigation", () => {
    const openOrders = vi.fn();
    const orders = Array.from({ length: 5 }, (_, i) => ({
      key: `order-${i}`, orderNumber: `FL-TEST-${i}`,
      productLabel: `套餐 ${i}`, kindLabel: "订单", createdAtLabel: "11/20 12:00",
      amountLabel: null, amountDetail: null, status: "active" as const, statusLabel: "已完成"
    }));
    render(
      <DashboardRecentOrders locale="zh" orders={orders} phase="ready"
        retryable={false} onRetry={vi.fn()} onOpenOrders={openOrders} />
    );
    expect(screen.getByText("套餐 0")).toBeTruthy();
    expect(screen.getByText("套餐 2")).toBeTruthy();
    expect(screen.queryByText("套餐 3")).toBeNull();
    expect(screen.queryByText("套餐 4")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
    expect(openOrders).toHaveBeenCalledTimes(1);
  });

  test("uses the compact wallet and start cards with working actions", () => {
    const onOpenWallet = vi.fn();
    const onStartUsing = vi.fn();
    const { rerender, container } = render(
      <DashboardWalletCard locale="zh" walletBalance={70} onOpenWallet={onOpenWallet} />
    );

    expect(screen.getByText("70")).toBeTruthy();
    expect(container.querySelector(".portal-dashboard-wallet-icon")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "去充值" }));
    expect(onOpenWallet).toHaveBeenCalledTimes(1);

    rerender(<DashboardStartCard locale="zh" onStartUsing={onStartUsing} />);
    expect(container.querySelector(".portal-dashboard-header-icon")).not.toBeNull();
    expect(container.querySelectorAll(".portal-v2-start-points svg")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "启动飞连VPN" }));
    expect(onStartUsing).toHaveBeenCalledTimes(1);
    rerender(<DashboardStartCard locale="zh" recommended onStartUsing={onStartUsing} />);
    expect(screen.getByText("推荐使用")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "查看使用教程" }));
    expect(onStartUsing).toHaveBeenCalledTimes(2);
  });
});


test("presents unified recent activity with authoritative amounts only", () => {
  const items = [
    {
      kind: "coins_consumption",
      key: "coins_consumption:coin-order-1",
      createdAt: "2026-11-18T12:00:00.000Z",
      status: "successful",
      source: {
        orderRef: "coin-order-1",
        offer: {
          category: "plan",
          title: { zh: "200 GB 年度套餐", en: "200 GB Annual Plan" }
        },
        amountUnits: 180
      }
    },
    {
      kind: "coin_recharge",
      key: "coin_recharge:recharge-order-1",
      createdAt: "2026-11-18T11:00:00.000Z",
      status: "successful",
      source: {
        orderRef: "recharge-order-1",
        expectedPaidCoinUnits: 110,
        amountMinor: 11000,
        currency: "CNY",
        currencyExponent: 2
      }
    },
    {
      kind: "service_access",
      key: "service_access:service-order-1",
      createdAt: "2026-11-18T10:00:00.000Z",
      status: "successful",
      source: {
        requestRef: "service-order-1",
        request: { historySummary: [{ label: "年度服务" }] },
        planId: "yearly"
      }
    }
  ] as never;

  const orders = presentDashboardRecentOrders(items, "zh");
  expect(orders[0].productLabel).toBe("200 GB 年度套餐");
  expect(orders[0].amountLabel).toBe("− 180 Coins");
  expect(orders[1].amountLabel).toBe("+ 110 Coins");
  expect(orders[1].amountDetail).toBe("CNY 110.00");
  expect(orders[2].productLabel).toBe("年度服务");
  expect(orders[2].amountLabel).toBeNull();
});

test("renders the unified amount and status without inventing a service-order amount", () => {
  const onOpenOrders = vi.fn();
  const orders = presentDashboardRecentOrders([
    {
      kind: "coins_consumption",
      key: "coins_consumption:coin-order-2",
      createdAt: "2026-11-18T12:00:00.000Z",
      status: "successful",
      source: {
        orderRef: "coin-order-2",
        offer: { category: "plan", title: { zh: "200 GB 年度套餐", en: "200 GB Annual Plan" } },
        amountUnits: 180
      }
    },
    {
      kind: "service_access",
      key: "service_access:service-order-2",
      createdAt: "2026-11-18T10:00:00.000Z",
      status: "successful",
      source: {
        requestRef: "service-order-2",
        request: { historySummary: [{ label: "年度服务" }] },
        planId: "yearly"
      }
    }
  ] as never, "zh");

  render(
    <DashboardRecentOrders
      locale="zh"
      orders={orders}
      phase="ready"
      retryable={false}
      onRetry={vi.fn()}
      onOpenOrders={onOpenOrders}
    />
  );

  expect(screen.getByText("− 180 Coins")).toBeTruthy();
  expect(screen.getAllByText("已完成")).toHaveLength(2);
  fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
  expect(onOpenOrders).toHaveBeenCalledTimes(1);
});

test("Web offer icon identity aligns with text while /portal markup remains intact", () => {
  const onPrimary = vi.fn();
  const offer = {
    offerRef: "test-plan",
    category: "plan",
    title: { zh: "月卡（30 天）", en: "30-day plan" },
    summary: { zh: "稳定连接", en: "Stable connection" },
    baseCoinUnits: 20
  } as never;
  const { container, rerender } = render(<MarketplaceOfferCard
    busy={false} dashboardAccent locale="zh" mode="purchase"
    offer={offer} onPrimary={onPrimary} />);
  expect(container.querySelector(".portal-marketplace-card__identity")).not.toBeNull();
  expect(screen.getByText("稳定连接")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: /使用 Coins 购买：月卡/ }));
  expect(onPrimary).toHaveBeenCalledTimes(1);
  rerender(<MarketplaceOfferCard busy={false} locale="zh" mode="purchase"
    offer={offer} onPrimary={onPrimary} />);
  expect(container.querySelector(".portal-marketplace-card__identity")).toBeNull();
  expect(screen.getByText("稳定连接")).toBeTruthy();
});


test("Web concept rail keeps the compact brand and functional navigation without the lower robot scene", () => {
  const locationBefore = window.location.pathname;
  const navigate = vi.fn();
  const groups = [{
    id: "main",
    label: "Navigation",
    items: [
      { id: "dashboard", label: "概览", description: "概览说明", icon: LayoutDashboard },
      { id: "referrals", label: "推荐", description: "邀请奖励", icon: Gift }
    ]
  }];
  try {
    window.history.replaceState({}, "", "/web/");
    const { container, rerender } = render(
      <PortalSidebar locale="zh" groups={groups} activeView="dashboard" walletBalance={null} onNavigate={navigate} />
    );
    expect(container.querySelector(".portal-sidebar-brand")).not.toBeNull();
    expect(container.querySelector(".portal-sidebar-brand img")?.getAttribute("src")).toBe("/web/portal-sidebar-mascot.webp");
    expect(container.querySelector(".portal-sidebar-scene")).toBeNull();
    expect(container.querySelectorAll(".portal-sidebar-brand img")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "概览" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "推荐" }));
    expect(navigate).toHaveBeenCalledWith("referrals");

    window.history.replaceState({}, "", "/portal/");
    rerender(<PortalSidebar locale="zh" groups={groups} activeView="dashboard" walletBalance={null} onNavigate={navigate} />);
    expect(container.querySelector(".portal-sidebar-brand")).toBeNull();
    expect(container.querySelector(".portal-sidebar-scene")).toBeNull();
    expect(screen.getByRole("button", { name: "推荐" })).toBeTruthy();
  } finally {
    window.history.replaceState({}, "", locationBefore);
  }
});

test("concept plan treatments keep real price and action on all three Web visual variants", () => {
  const onPrimary = vi.fn();
  const offer = {
    offerRef: "test-plan",
    category: "plan",
    title: { zh: "真实服务套餐", en: "Real service plan" },
    summary: { zh: "服务端真实说明", en: "Actual catalog description" },
    baseCoinUnits: 63
  } as never;
  const { container, rerender } = render(
    <MarketplaceOfferCard
      busy={false} dashboardAccent dashboardVariant={0} locale="zh"
      mode="purchase" offer={offer} onPrimary={onPrimary}
    />
  );
  for (const variant of [0,1,2] as const) {
    rerender(<MarketplaceOfferCard
      busy={false} dashboardAccent dashboardVariant={variant} locale="zh"
      mode="purchase" offer={offer} onPrimary={onPrimary}
    />);
    expect(container.querySelector(`.portal-marketplace-card__concept-${variant}`)).not.toBeNull();
    expect(container.querySelector(".portal-marketplace-card__illustration")).not.toBeNull();
    expect(screen.getByText("真实服务套餐")).toBeTruthy();
    expect(screen.getByText("63")).toBeTruthy();
    expect(screen.getByRole("button", { name: /使用 Coins 购买：真实服务套餐/ }).textContent).toContain("立即购买");
  }
  fireEvent.click(screen.getByRole("button", { name: /使用 Coins 购买：真实服务套餐/ }));
  expect(onPrimary).toHaveBeenCalledTimes(1);
  rerender(<MarketplaceOfferCard busy={false} locale="zh" mode="purchase"
    offer={offer} onPrimary={onPrimary} />);
  expect(container.querySelector(".portal-marketplace-card__illustration")).toBeNull();
  expect(screen.getByText("使用 Coins 购买")).toBeTruthy();
});
