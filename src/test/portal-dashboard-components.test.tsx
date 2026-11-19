import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardRecentOrders } from "../features/user-portal/dashboard/dashboard-recent-orders";
import { DashboardWalletCard } from "../features/user-portal/dashboard/dashboard-wallet-card";
import { DashboardStartCard } from "../features/user-portal/dashboard/dashboard-start-card";

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
