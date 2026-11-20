import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { DashboardSubscriptionCard } from "../features/user-portal/dashboard/dashboard-subscription-card";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const props = () => ({
  locale: "zh" as const,
  initialUrl: "",
  userRef: "user_demo",
  requestRef: "request_demo",
  canReveal: true,
  canReset: true,
  walletFirstAccount: false,
  onReveal: vi.fn().mockResolvedValue("https://sub.example.test/sub/demo"),
  onReset: vi.fn().mockResolvedValue("https://sub.example.test/sub/new"),
  onOpenGuide: vi.fn(),
  onOpenMarketplace: vi.fn()
});

describe("Web Dashboard subscription manager", () => {
  test("does not deliver or reset a subscription on mount", async () => {
    const args = props();
    render(<DashboardSubscriptionCard {...args} />);
    expect(screen.getByRole("heading", { name: "订阅链接" })).toBeTruthy();
    expect(screen.getByLabelText("订阅链接文本").getAttribute("value")).toBe("");
    expect(screen.getByText("查看链接后生成二维码")).toBeTruthy();
    expect(screen.queryByAltText("当前订阅链接二维码")).toBeNull();
    expect(screen.getByRole("button", { name: "复制" }).hasAttribute("disabled")).toBe(true);
    await Promise.resolve();
    expect(args.onReveal).not.toHaveBeenCalled();
    expect(args.onReset).not.toHaveBeenCalled();
  });

  test("reveals only after explicit More → View; then enables copy", async () => {
    const args = props();
    render(<DashboardSubscriptionCard {...args} />);
    fireEvent.click(screen.getByRole("button", { name: "更多订阅操作" }));
    fireEvent.click(screen.getByRole("button", { name: "查看订阅" }));
    await waitFor(() => expect(args.onReveal).toHaveBeenCalledTimes(1));
    await waitFor(() => expect((screen.getByLabelText("订阅链接文本") as HTMLInputElement).value)
      .toBe("https://sub.example.test/sub/demo"));
    expect(screen.getByRole("button", { name: "复制" }).hasAttribute("disabled")).toBe(false);
    expect(args.onReset).not.toHaveBeenCalled();
  });

  test("wallet-first resource always delegates to the explicit setup guide", () => {
    const args = { ...props(), walletFirstAccount: true, canReveal: false, canReset: false };
    render(<DashboardSubscriptionCard {...args} />);
    expect(screen.getByRole("button", { name: "重置" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "更多订阅操作" }));
    fireEvent.click(screen.getByRole("button", { name: "查看订阅" }));
    expect(args.onOpenGuide).toHaveBeenCalledTimes(1);
    expect(args.onReveal).not.toHaveBeenCalled();
    expect(args.onReset).not.toHaveBeenCalled();
  });

  test("reset requires confirmation, retains a scoped recovery key, and replaces the old URL", async () => {
    vi.stubGlobal("crypto", { randomUUID: () => "00000000-0000-4000-8000-000000000001" });
    const args = { ...props(), initialUrl: "https://sub.example.test/sub/old" };
    render(<DashboardSubscriptionCard {...args} />);
    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(screen.getByRole("dialog", { name: "确认重置订阅链接" })).toBeTruthy();
    expect(args.onReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "确认重置" }));
    await waitFor(() => expect(args.onReset).toHaveBeenCalledWith(
      "00000000-0000-4000-8000-000000000001", "request_demo"
    ));
    await waitFor(() => expect((screen.getByLabelText("订阅链接文本") as HTMLInputElement).value)
      .toBe("https://sub.example.test/sub/new"));
    expect(screen.queryByRole("dialog", { name: "确认重置订阅链接" })).toBeNull();
  });

  test("client tile copies the URL then opens the real import guide", async () => {
    const copy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, "clipboard", { configurable: true, value: { writeText: copy } });
    const args = { ...props(), initialUrl: "https://sub.example.test/sub/demo" };
    render(<DashboardSubscriptionCard {...args} />);
    fireEvent.click(screen.getByRole("button", { name: "复制订阅并查看 Clash 导入教程" }));
    await waitFor(() => expect(copy).toHaveBeenCalledWith("https://sub.example.test/sub/demo"));
    expect(args.onOpenGuide).toHaveBeenCalledTimes(1);
    expect(args.onReveal).not.toHaveBeenCalled();
  });
});
