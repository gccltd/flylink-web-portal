import {
  BarChart3,
  ReceiptText,
  Rocket,
  ShieldCheck,
  WalletCards,
  Zap
} from "lucide-react";

type DashboardOverviewDestination = "marketplace" | "wallet" | "orders" | "start";
type DashboardResourceState = "active" | "pending" | "empty";

type DashboardOverviewCardProps = {
  locale: "zh" | "en";
  greeting: string;
  description: string;
  currentPlanLabel: string | null;
  hasCurrentPlan: boolean;
  resourceState: DashboardResourceState;
  resourceReconciliation: boolean;
  resourceExpiry: string;
  hasTrafficAccess: boolean;
  planTrafficBytes: number;
  remainingTrafficBytes: number | null;
  remainingTrafficPercent: number;
  trafficHeroLabel: string;
  walletBalance: number | null;
  onRenewCurrentPlan?: () => void;
  onNavigate: (view: DashboardOverviewDestination) => void;
};

function uiText(locale: "zh" | "en", zh: string, en: string) {
  return locale === "en" ? en : zh;
}

export function DashboardOverviewCard({
  locale,
  greeting,
  description,
  currentPlanLabel,
  hasCurrentPlan,
  resourceState,
  resourceReconciliation,
  resourceExpiry,
  hasTrafficAccess,
  planTrafficBytes,
  remainingTrafficBytes,
  remainingTrafficPercent,
  trafficHeroLabel,
  walletBalance,
  onRenewCurrentPlan,
  onNavigate
}: DashboardOverviewCardProps) {
  return (
    <section
      className="portal-v2-hero-block"
      aria-label={uiText(locale, "账户总览", "Account overview")}
    >
      <div className="portal-v2-greeting">
        <h2>{greeting}</h2>
        <p>{description}</p>
      </div>
      <div className="portal-v2-hero-card">
        <div className="portal-v2-hero-card__cell">
          <span className="portal-card-label">
            <ShieldCheck aria-hidden="true" /> {uiText(locale, "当前套餐", "Current plan")}
          </span>
          <strong>{currentPlanLabel ?? uiText(locale, "未开通套餐", "No active plan")}</strong>
          <small>
            {resourceState === "active" ? (
              <>
                <span className="portal-order-status active">
                  {uiText(locale, "使用中", "In use")}
                </span>
                {" "}
                {uiText(locale, "有效期至 ", "Valid until ")}
                {resourceExpiry}
              </>
            ) : resourceReconciliation
              ? uiText(locale, "资源状态核对中", "Resource state is being reconciled")
              : uiText(locale, "前往商城开通服务", "Buy a service in the Marketplace")}
          </small>
        </div>
        <div className="portal-v2-hero-card__cell">
          <span className="portal-card-label">
            <BarChart3 aria-hidden="true" /> {uiText(locale, "本月剩余流量", "Monthly traffic left")}
          </span>
          <strong>{trafficHeroLabel}</strong>
          {hasTrafficAccess && planTrafficBytes > 0 && remainingTrafficBytes !== null ? (
            <div className="portal-traffic-meter" aria-hidden="true">
              <span style={{ width: Math.min(100, Math.max(0, remainingTrafficPercent)) + "%" }} />
            </div>
          ) : (
            <small>
              {resourceReconciliation
                ? uiText(locale, "核对完成前暂不展示流量数据", "Traffic details are hidden until reconciliation completes")
                : hasTrafficAccess
                  ? uiText(locale, "当前资源接口未提供实时用量", "Live usage is not available from the current resource API")
                  : uiText(locale, "资源开通后显示", "Shown after the resource is active")}
            </small>
          )}
        </div>
        <div className="portal-v2-hero-card__cell">
          <span className="portal-card-label">
            <WalletCards aria-hidden="true" /> {uiText(locale, "钱包余额", "Wallet balance")}
          </span>
          <strong>{walletBalance === null ? "—" : walletBalance + " Coins"}</strong>
          <small>{uiText(locale, "可用于套餐续费与抵扣", "Usable for plan renewal and credit")}</small>
        </div>
        <div className="portal-v2-hero-card__actions">
          <button
            className="portal-v2-hero-action portal-v2-hero-action--primary"
            type="button"
            onClick={onRenewCurrentPlan ?? (() => onNavigate("marketplace"))}
          >
            <Zap aria-hidden="true" />
            {resourceState === "active" && hasCurrentPlan
              ? uiText(locale, "一键续费", "Renew in one tap")
              : uiText(locale, "去商城选套餐", "Browse plans")}
          </button>
          <button
            className="portal-v2-hero-action"
            type="button"
            onClick={() => onNavigate("wallet")}
          >
            <WalletCards aria-hidden="true" />
            {uiText(locale, "去充值", "Top up")}
          </button>
          <button
            className="portal-v2-hero-action"
            type="button"
            onClick={() => onNavigate("orders")}
          >
            <ReceiptText aria-hidden="true" />
            {uiText(locale, "我的订单", "My orders")}
          </button>
          <button
            className="portal-v2-hero-action"
            type="button"
            onClick={() => onNavigate("start")}
          >
            <Rocket aria-hidden="true" />
            {uiText(locale, "开始使用", "Start using")}
          </button>
        </div>
      </div>
    </section>
  );
}
