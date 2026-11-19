import type { PortalOrderCenterItem, PortalOrderCenterStatus } from "../orders/portal-order-center-model";
import type { PortalPlanId } from "../user-portal-client";

export type DashboardRecentOrder = {
  key: string;
  orderNumber: string;
  productLabel: string;
  kindLabel: string;
  createdAtLabel: string;
  amountLabel: string | null;
  amountDetail: string | null;
  status: "active" | "pending" | "attention" | "closed";
  statusLabel: string;
};

type DashboardLocale = "zh" | "en";

function text(locale: DashboardLocale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

function planLabel(planId: PortalPlanId, locale: DashboardLocale) {
  const labels: Record<PortalPlanId, [string, string]> = {
    trial: ["试用套餐", "Trial plan"],
    monthly: ["月度套餐", "Monthly plan"],
    monthly_basic: ["基础月度套餐", "Basic monthly plan"],
    monthly_plus: ["标准月度套餐", "Plus monthly plan"],
    yearly: ["年度套餐", "Annual plan"]
  };
  return text(locale, ...labels[planId]);
}

function displayOrderNumber(item: PortalOrderCenterItem) {
  const raw = item.kind === "service_access"
    ? item.source.requestRef
    : item.source.orderRef;
  const normalized = item.kind === "service_access"
    ? raw.replace(/^subreq[_-]?/iu, "O-")
    : item.kind === "legacy_payment"
      ? raw.replace(/^pay[_-]?/iu, "P-")
      : raw;
  return normalized.length > 18
    ? normalized.slice(0, 9) + "…" + normalized.slice(-6)
    : normalized;
}

function formatDateTime(value: string, locale: DashboardLocale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatCurrencyMinor(amountMinor: number, currency: string, exponent: number) {
  if (!Number.isFinite(amountMinor) || !Number.isInteger(exponent) || exponent < 0 || exponent > 9) {
    return null;
  }
  return currency + " " + (amountMinor / (10 ** exponent)).toFixed(exponent);
}

function statusPresentation(status: PortalOrderCenterStatus, locale: DashboardLocale) {
  switch (status) {
    case "successful":
      return { status: "active" as const, statusLabel: text(locale, "已完成", "Completed") };
    case "in_progress":
      return { status: "pending" as const, statusLabel: text(locale, "处理中", "In progress") };
    case "attention":
      return { status: "attention" as const, statusLabel: text(locale, "需要处理", "Needs attention") };
    case "closed":
      return { status: "closed" as const, statusLabel: text(locale, "已关闭", "Closed") };
  }
}

function productPresentation(item: PortalOrderCenterItem, locale: DashboardLocale) {
  if (item.kind === "coins_consumption") {
    return {
      productLabel: item.source.offer.title[locale],
      kindLabel: item.source.offer.category === "plan"
        ? text(locale, "套餐消费", "Plan purchase")
        : text(locale, "流量包消费", "Data pack purchase"),
      amountLabel: "− " + item.source.amountUnits + " Coins",
      amountDetail: null
    };
  }
  if (item.kind === "coin_recharge") {
    return {
      productLabel: text(locale, "钱包充值", "Wallet top-up"),
      kindLabel: text(locale, "Coins 充值", "Coins recharge"),
      amountLabel: "+ " + item.source.expectedPaidCoinUnits + " Coins",
      amountDetail: formatCurrencyMinor(
        item.source.amountMinor,
        item.source.currency,
        item.source.currencyExponent
      )
    };
  }
  if (item.kind === "legacy_payment") {
    return {
      productLabel: locale === "zh" && item.source.planLabel?.trim()
        ? item.source.planLabel.trim()
        : planLabel(item.source.planId, locale),
      kindLabel: text(locale, "套餐支付", "Plan payment"),
      amountLabel: formatCurrencyMinor(item.source.amountMinor, item.source.currency, 2),
      amountDetail: null
    };
  }
  return {
    productLabel: item.source.request.historySummary?.[0]?.label || planLabel(item.source.planId, locale),
    kindLabel: text(locale, "服务记录", "Service record"),
    // Service access rows have no authoritative charge amount; do not infer one.
    amountLabel: null,
    amountDetail: null
  };
}

export function presentDashboardRecentOrders(
  items: readonly PortalOrderCenterItem[],
  locale: DashboardLocale
): DashboardRecentOrder[] {
  return items.map((item) => ({
    key: item.key,
    orderNumber: displayOrderNumber(item),
    createdAtLabel: formatDateTime(item.createdAt, locale),
    ...productPresentation(item, locale),
    ...statusPresentation(item.status, locale)
  }));
}
