import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardRecentOrders } from "../features/user-portal/dashboard/dashboard-recent-orders";
import { DashboardWalletCard } from "../features/user-portal/dashboard/dashboard-wallet-card";
import { DashboardStartCard } from "../features/user-portal/dashboard/dashboard-start-card";
import { presentDashboardRecentOrders } from "../features/user-portal/dashboard/dashboard-recent-orders-model";

afterEach(() => cleanup());

describe("Portal Dashboard components", () => {
  test("keeps recent-order actions routed to Orders regardless of viewport layout", () => {
    const onOpenOrders = vi.fn();

    render(
      <DashboardRecentOrders
        locale="zh"
        orders={[{
          requestRef: "service-1",
          orderNumber: "FL-1001",
          planLabel: "年度套餐",
          createdAt: "2026-11-18 10:00",
          status: "active",
          statusLabel: "生效中"
        }]}
        onOpenOrders={onOpenOrders}
      />
    );

    expect(screen.getByText("FL-1001")).toBeTruthy();
    expect(screen.getByText("年度套餐 · 2026-11-18 10:00")).toBeTruthy();
    expect(screen.queryByText(/Coins/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "查看订单" }));
    fireEvent.click(screen.getByRole("button", { name: /FL-1001/ }));
    expect(onOpenOrders).toHaveBeenCalledTimes(2);
  });

  test("uses the compact wallet and start cards with working actions", () => {
    const onOpenWallet = vi.fn();
    const onStartUsing = vi.fn();
    const { rerender } = render(
      <DashboardWalletCard locale="zh" walletBalance={70} onOpenWallet={onOpenWallet} />
    );

    expect(screen.getByText("70")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "去充值" }));
    expect(onOpenWallet).toHaveBeenCalledTimes(1);

    rerender(<DashboardStartCard locale="zh" onStartUsing={onStartUsing} />);
    fireEvent.click(screen.getByRole("button", { name: "启动飞连VPN" }));
    expect(onStartUsing).toHaveBeenCalledTimes(1);
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
  expect(screen.getByText("已完成")).toBeTruthy();
  expect(screen.queryByText(/Coins/, { selector: ".service-order-amount" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "查看全部" }));
  expect(onOpenOrders).toHaveBeenCalledTimes(1);
});
