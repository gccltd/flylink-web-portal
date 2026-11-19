import { afterEach, expect, test, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  PortalCoinCommerceClientError,
  type PortalCoinCommerceClient
} from "../features/user-portal/commerce";
import {
  PortalRechargeClientError,
  type PortalRechargeClient
} from "../features/user-portal/recharge";
import {
  usePortalDashboardRecentActivity
} from "../features/user-portal/dashboard/use-portal-dashboard-recent-activity";

afterEach(() => {
  vi.restoreAllMocks();
});

test("loads coin and recharge orders through the existing read clients", async () => {
  const coinClient = {
    listOrders: vi.fn().mockResolvedValue({
      orders: [{
        orderRef: "coin-order-1",
        createdAt: "2026-11-18T12:00:00.000Z",
        amountUnits: 180,
        offer: { category: "plan", title: { zh: "年度套餐", en: "Annual plan" } }
      }],
      nextCursor: null
    })
  } as unknown as PortalCoinCommerceClient;
  const rechargeClient = {
    listOrders: vi.fn().mockResolvedValue([{
      orderRef: "recharge-order-1",
      createdAt: "2026-11-18T11:00:00.000Z",
      expectedPaidCoinUnits: 110
    }])
  } as unknown as PortalRechargeClient;

  const { result } = renderHook(() => usePortalDashboardRecentActivity({
    commerceClient: coinClient,
    rechargeClient,
    enableCoinOrders: true,
    legacyPaymentOrders: [],
    serviceOrders: [],
    sessionRef: "session-a",
    sessionGeneration: 1,
    onSessionInvalid: vi.fn()
  }));

  await waitFor(() => expect(result.current.phase).toBe("ready"));
  expect(coinClient.listOrders).toHaveBeenCalledWith({ sessionRef: "session-a", limit: 25 });
  expect(rechargeClient.listOrders).toHaveBeenCalledWith({ sessionRef: "session-a" });
  expect(result.current.items.map((item) => item.kind)).toEqual([
    "coins_consumption",
    "coin_recharge"
  ]);
});

test("keeps successful source data visible when the other read source is unavailable", async () => {
  const coinClient = {
    listOrders: vi.fn().mockRejectedValue(new Error("temporary failure"))
  } as unknown as PortalCoinCommerceClient;
  const rechargeClient = {
    listOrders: vi.fn().mockResolvedValue([{
      orderRef: "recharge-order-2",
      createdAt: "2026-11-18T11:00:00.000Z",
      expectedPaidCoinUnits: 110
    }])
  } as unknown as PortalRechargeClient;

  const { result } = renderHook(() => usePortalDashboardRecentActivity({
    commerceClient: coinClient,
    rechargeClient,
    enableCoinOrders: true,
    legacyPaymentOrders: [],
    serviceOrders: [],
    sessionRef: "session-a",
    sessionGeneration: 1,
    onSessionInvalid: vi.fn()
  }));

  await waitFor(() => expect(result.current.phase).toBe("partial"));
  expect(result.current.items).toHaveLength(1);
  expect(result.current.retryable).toBe(true);
});

test("invalidates the session when a read client reports an expired session", async () => {
  const onSessionInvalid = vi.fn();
  const coinClient = {
    listOrders: vi.fn().mockRejectedValue(
      new PortalCoinCommerceClientError("commerce_session_invalid", false)
    )
  } as unknown as PortalCoinCommerceClient;

  renderHook(() => usePortalDashboardRecentActivity({
    commerceClient: coinClient,
    rechargeClient: null,
    enableCoinOrders: true,
    legacyPaymentOrders: [],
    serviceOrders: [],
    sessionRef: "session-a",
    sessionGeneration: 1,
    onSessionInvalid
  }));

  await waitFor(() => expect(onSessionInvalid).toHaveBeenCalledTimes(1));
});
