import { ReceiptText, RefreshCw } from "lucide-react";
import type { DashboardRecentOrder } from "./dashboard-recent-orders-model";
import type { PortalDashboardActivityPhase } from "./use-portal-dashboard-recent-activity";

type DashboardLocale = "zh" | "en";

type DashboardRecentOrdersProps = {
  locale: DashboardLocale;
  orders: readonly DashboardRecentOrder[];
  phase: PortalDashboardActivityPhase;
  retryable: boolean;
  onRetry: () => void;
  onOpenOrders: () => void;
};

function text(locale: DashboardLocale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

export function DashboardRecentOrders({
  locale,
  orders,
  phase,
  retryable,
  onRetry,
  onOpenOrders
}: DashboardRecentOrdersProps) {
  return (
    <article className="portal-v2-panel portal-v2-dashboard-orders">
      <div className="portal-v2-panel-header">
        <div>
          <span className="portal-card-label">{text(locale, "交易与订单", "Transactions")}</span>
          <h3>{text(locale, "近期订单", "Recent activity")}</h3>
        </div>
        <button className="portal-link-button" type="button" onClick={onOpenOrders}>
          {text(locale, "查看全部", "View all")}
        </button>
      </div>
      {orders.length > 0 ? (
        <>
          <div className="portal-v2-list">
            {orders.slice(0, 3).map((order) => (
              <button key={order.key} type="button" onClick={onOpenOrders}>
                <span className="portal-v2-dashboard-order-main">
                  <strong>{order.productLabel}</strong>
                  <small>{order.kindLabel} · {order.orderNumber} · {order.createdAtLabel}</small>
                </span>
                <span className="portal-v2-dashboard-order-meta">
                  {order.amountLabel ? (
                    <strong className="portal-v2-dashboard-order-amount">{order.amountLabel}</strong>
                  ) : null}
                  {order.amountDetail ? (
                    <small className="portal-v2-dashboard-order-amount-detail">{order.amountDetail}</small>
                  ) : null}
                  <em className={"portal-order-status " + order.status}>{order.statusLabel}</em>
                </span>
              </button>
            ))}
          </div>
          {phase === "partial" || phase === "loading" ? (
            <p className="portal-v2-dashboard-activity-note" role="status">
              {phase === "loading"
                ? text(locale, "正在同步其他交易记录。", "Syncing additional activity.")
                : text(locale, "部分交易记录暂时无法读取。", "Some activity is temporarily unavailable.")}
              {retryable ? (
                <button type="button" onClick={onRetry}>{text(locale, "重试", "Retry")}</button>
              ) : null}
            </p>
          ) : null}
        </>
      ) : phase === "loading" ? (
        <div className="portal-v2-empty" role="status" aria-live="polite">
          <RefreshCw aria-hidden="true" />
          <strong>{text(locale, "正在读取近期订单", "Loading recent activity")}</strong>
          <span>{text(locale, "正在同步套餐订单与钱包交易。", "Syncing plan orders and wallet activity.")}</span>
        </div>
      ) : phase === "partial" ? (
        <div className="portal-v2-empty" role="status">
          <ReceiptText aria-hidden="true" />
          <strong>{text(locale, "部分交易记录暂不可用", "Some activity is unavailable")}</strong>
          <span>{text(locale, "当前没有可显示的记录，稍后可以重新加载。", "No records are available yet. You can retry shortly.")}</span>
          {retryable ? (
            <button className="portal-link-button" type="button" onClick={onRetry}>
              {text(locale, "重新加载", "Reload")}
            </button>
          ) : null}
        </div>
      ) : phase === "error" ? (
        <div className="portal-v2-empty" role="alert">
          <ReceiptText aria-hidden="true" />
          <strong>{text(locale, "暂时无法读取订单", "Recent activity is unavailable")}</strong>
          <span>{text(locale, "请稍后重试，或前往订单中心查看。", "Try again shortly or open the Orders center.")}</span>
          {retryable ? (
            <button className="portal-link-button" type="button" onClick={onRetry}>
              {text(locale, "重新加载", "Reload")}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="portal-v2-empty">
          <ReceiptText aria-hidden="true" />
          <strong>{text(locale, "暂无订单", "No recent activity")}</strong>
          <span>{text(locale, "套餐消费、钱包充值与服务记录会显示在这里。", "Plan purchases, wallet top-ups, and service records appear here.")}</span>
        </div>
      )}
    </article>
  );
}
