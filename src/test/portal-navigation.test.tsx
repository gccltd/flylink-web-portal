import { afterEach, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { readPortalLocation } from "../features/user-portal/portal-browser-session";
import type { PortalSession } from "../features/user-portal/user-portal-types";
import { usePortalNavigation } from "../features/user-portal/use-portal-navigation";

const session = {
  status: "authenticated_preview",
  sessionRef: `portalctx_${"a".repeat(64)}`,
  transport: "cookie",
  expiresAt: "2027-01-01T00:00:00.000Z",
  userRef: "account_test",
  displayName: "Test Account",
  authMode: "password",
  registeredAt: "2026-11-19T00:00:00.000Z",
  safety: {
    noAdminApi: true,
    noPublicAuthActivated: true,
    noRawPasswordReturned: true
  }
} satisfies PortalSession;

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

test("restores allowlisted navigation and writes URL state only for an authenticated session", () => {
  window.history.replaceState(null, "", "/#portal=orders&orders=coin_recharge");

  const { result, rerender } = renderHook(
    ({ currentSession }) => usePortalNavigation(currentSession),
    { initialProps: { currentSession: null as PortalSession | null } }
  );

  expect(result.current.activeView).toBe("orders");
  expect(result.current.orderCenterFilter).toBe("coin_recharge");

  act(() => result.current.setActiveView("wallet"));
  expect(window.location.hash).toBe("#portal=orders&orders=coin_recharge");

  rerender({ currentSession: session });
  expect(window.location.hash).toBe("#portal=wallet");
  expect(readPortalLocation().view).toBe("wallet");

  act(() => {
    result.current.setActiveView("profile");
    result.current.setPersonalCenterSubview("security");
  });
  expect(window.location.hash).toBe("#portal=profile&profile=security");
});

test("navigation helpers reset dependent state and keep the topbar menu local", () => {
  const { result } = renderHook(() => usePortalNavigation(session));

  act(() => result.current.navigatePortalOrderFilter("coin_recharge"));
  expect(result.current.activeView).toBe("orders");
  expect(result.current.orderCenterFilter).toBe("coin_recharge");

  act(() => result.current.navigatePortalView("profile"));
  expect(result.current.activeView).toBe("profile");
  expect(result.current.orderCenterFilter).toBe("all");
  expect(result.current.personalCenterSubview).toBe("profile");

  act(() => result.current.setPersonalCenterSubview("security"));
  expect(window.location.hash).toBe("#portal=profile&profile=security");

  act(() => result.current.setTopbarUserMenuOpen(true));
  expect(result.current.topbarUserMenuOpen).toBe(true);
});
