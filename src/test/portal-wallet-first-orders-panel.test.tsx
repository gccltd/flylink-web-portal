import { afterEach, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  PortalCoinCommerceClientError,
  type PortalDeferredTransition,
  type PortalWalletFirstCommerceClient
} from "../features/user-portal/commerce";
import { PortalWalletFirstOrdersPanel } from "../features/user-portal/orders/portal-wallet-first-orders-panel";

const TRANSITION: PortalDeferredTransition = {
  transitionRef: "transition_wallet_first_history_1",
  offer: {
    offerRef: "offer_annual_history_test",
    offerVersionRef: "offer_version_annual_history_test",
    category: "plan",
    title: { zh: "年度套餐", en: "Annual plan" },
    summary: { zh: "年度服务", en: "Annual service" },
    importantNotices: { zh: [], en: [] },
    baseCoinUnits: 200,
    referencePrice: { currency: "CNY", amountMinor: 20_000 },
    acceptedCoinTypes: ["paid_coins"],
    delivery: {
      kind: "subscription_plan",
      durationDays: 365,
      monthlyTrafficGb: 200,
      trafficGb: null,
      neverExpires: false,
      discountBasisPoints: 0
    }
  },
  amountUnits: 200,
  flowKind: "scheduled_switch",
  scheduledFor: "2027-08-13T00:00:00.000Z",
  state: "reserved",
  safeCode: null,
  reservedAt: "2026-08-13T00:00:00.000Z",
  settledAt: null,
  createdAt: "2026-08-13T00:00:00.000Z",
  updatedAt: "2026-08-13T00:00:00.000Z"
};

function client(listDeferredTransitions: () => Promise<PortalDeferredTransition[]>) {
  return {
    listDeferredTransitions
  } as unknown as PortalWalletFirstCommerceClient;
}

afterEach(() => {
  cleanup();
});

test("renders server-projected service transitions without presenting them as ordinary orders", async () => {
  const listDeferredTransitions = vi.fn(async () => [TRANSITION]);
  render(
    <PortalWalletFirstOrdersPanel
      commerceClient={client(listDeferredTransitions)}
      locale="zh"
      sessionRef="portal_session_wallet_first"
    />
  );

  expect(await screen.findByText("年度套餐")).toBeInTheDocument();
  expect(screen.getByText("已预留，等待执行")).toBeInTheDocument();
  expect(screen.getByText("到期后切换")).toBeInTheDocument();
  expect(screen.getByText("365 天 · 每月 200 GB")).toBeInTheDocument();
  expect(screen.getByText("200 Coins")).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "取消预留" })).not.toBeInTheDocument();
  expect(listDeferredTransitions).toHaveBeenCalledWith({ sessionRef: "portal_session_wallet_first" });
});

test("shows an honest empty state when the server has no transitions", async () => {
  render(
    <PortalWalletFirstOrdersPanel
      commerceClient={client(vi.fn(async () => []))}
      locale="zh"
      sessionRef="portal_session_wallet_first"
    />
  );

  expect(await screen.findByRole("status")).toHaveTextContent("暂无服务切换记录。");
});

test("retains a retryable failure state and retries the read endpoint", async () => {
  const listDeferredTransitions = vi.fn()
    .mockRejectedValueOnce(new PortalCoinCommerceClientError("commerce_unavailable", true))
    .mockResolvedValueOnce([TRANSITION]);
  render(
    <PortalWalletFirstOrdersPanel
      commerceClient={client(listDeferredTransitions)}
      locale="zh"
      sessionRef="portal_session_wallet_first"
    />
  );

  expect(await screen.findByRole("alert")).toHaveTextContent("服务切换记录加载失败。");
  fireEvent.click(screen.getByRole("button", { name: "重试" }));
  expect(await screen.findByText("年度套餐")).toBeInTheDocument();
  await waitFor(() => expect(listDeferredTransitions).toHaveBeenCalledTimes(2));
});
