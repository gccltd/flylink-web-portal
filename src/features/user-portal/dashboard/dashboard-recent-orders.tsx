import { ReceiptText } from "lucide-react";

type DashboardLocale = "zh" | "en";

export type DashboardRecentOrder = {
  requestRef: string;
  orderNumber: string;
  planLabel: string;
  createdAt: string;
  status: string;
  statusLabel: string;
};

type DashboardRecentOrdersProps = {
  locale: DashboardLocale;
  orders: readonly DashboardRecentOrder[];
  onOpenOrders: () => void;
};

function text(locale: DashboardLocale, zh: string, en: string) {
  return locale === "zh" ? zh : en;
}

export function DashboardRecentOrders({
  locale,
  orders,
  onOpenOrders,
}: DashboardRecentOrdersProps) {
  return (
    <article className="portal-v2-panel portal-v2-dashboard-orders">
      <div className="portal-v2-panel-header">
        <div>
          <span className="portal-card-label">{text(locale, "最近订单", "Recent orders")}</span>
          <h3>{text(locale, "订单活动", "Order activity")}</h3>
        </div>
        <button className="portal-link-button" type="button" onClick={onOpenOrders}>
          {text(locale, "查看订单", "View orders")}
        </button>
      </div>
      {orders.length > 0 ? (
        <div className="portal-v2-list">
          {orders.map((order) => (
            <button key={order.requestRef} type="button" onClick={onOpenOrders}>
              <span>
                <strong>{order.orderNumber}</strong>
                <small>{order.planLabel} · {order.createdAt}</small>
              </span>
              <em className={`portal-order-status ${order.status}`}>{order.statusLabel}</em>
            </button>
          ))}
        </div>
      ) : (
        <div className="portal-v2-empty">
          <ReceiptText aria-hidden="true" />
          <strong>{text(locale, "暂无订单", "No orders yet")}</strong>
          <span>{text(locale, "商城订单和续费记录会在这里显示。", "Marketplace orders and renewal records appear here.")}</span>
        </div>
      )}
    </article>
  );
}
