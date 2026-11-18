import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DashboardOverviewCard } from "../features/user-portal/dashboard/dashboard-overview-card";

afterEach(() => cleanup());

test("renders authoritative overview values and keeps unavailable traffic usage explicit", () => {
  const onNavigate = vi.fn();
  const onRenewCurrentPlan = vi.fn();

  render(
    <DashboardOverviewCard
      locale="zh"
      greeting="上午好，欢迎回到飞连VPN"
      description="管理你的套餐、流量与订单。"
      currentPlanLabel="200 GB 年度套餐"
      hasCurrentPlan
      resourceState="active"
      resourceReconciliation={false}
      resourceExpiry="2027-11-18"
      hasTrafficAccess
      planTrafficBytes={200 * 1024 ** 3}
      remainingTrafficBytes={null}
      remainingTrafficPercent={0}
      trafficHeroLabel="用量待同步"
      walletBalance={70}
      onRenewCurrentPlan={onRenewCurrentPlan}
      onNavigate={onNavigate}
    />
  );

  expect(screen.getByText("200 GB 年度套餐")).toBeTruthy();
  expect(screen.getByText("用量待同步")).toBeTruthy();
  expect(screen.getByText("当前资源接口未提供实时用量")).toBeTruthy();
  expect(screen.getByText("70 Coins")).toBeTruthy();

  fireEvent.click(screen.getByRole("button", { name: "一键续费" }));
  expect(onRenewCurrentPlan).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "去充值" }));
  expect(onNavigate).toHaveBeenCalledWith("wallet");
  fireEvent.click(screen.getByRole("button", { name: "我的订单" }));
  expect(onNavigate).toHaveBeenCalledWith("orders");
  fireEvent.click(screen.getByRole("button", { name: "开始使用" }));
  expect(onNavigate).toHaveBeenCalledWith("start");
});

test("reconciliation state hides traffic details and sends unentitled accounts to the marketplace", () => {
  const onNavigate = vi.fn();

  render(
    <DashboardOverviewCard
      locale="zh"
      greeting="欢迎回到飞连VPN"
      description="管理你的套餐、流量与订单。"
      currentPlanLabel={null}
      hasCurrentPlan={false}
      resourceState="pending"
      resourceReconciliation
      resourceExpiry="状态核对中"
      hasTrafficAccess={false}
      planTrafficBytes={0}
      remainingTrafficBytes={null}
      remainingTrafficPercent={0}
      trafficHeroLabel="—"
      walletBalance={null}
      onNavigate={onNavigate}
    />
  );

  expect(screen.getByText("资源状态核对中")).toBeTruthy();
  expect(screen.getByText("核对完成前暂不展示流量数据")).toBeTruthy();
  expect(screen.queryByText("用量待同步")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "去商城选套餐" }));
  expect(onNavigate).toHaveBeenCalledWith("marketplace");
});
