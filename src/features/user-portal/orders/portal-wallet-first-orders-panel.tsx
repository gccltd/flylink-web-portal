import { useEffect, useRef, useState } from "react";
import { PortalCoinCommerceClientError, type PortalDeferredTransition, type PortalWalletFirstCommerceClient } from "../commerce";
import { formatPortalDateTime } from "../portal-commerce-presentation";

type PortalWalletFirstOrdersLocale = "zh" | "en";

type LoadState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error"; retryable: boolean }
  | {
      status: "ready";
      transitions: PortalDeferredTransition[];
      refreshing: boolean;
      refreshError: boolean;
      retryable: boolean;
    };

const TRANSITION_STATE_LABELS: Record<
  PortalDeferredTransition["state"],
  { zh: string; en: string }
> = {
  reserved: { zh: "已预留，等待执行", en: "Reserved and awaiting execution" },
  processing: { zh: "正在执行", en: "Applying" },
  effect_applied: { zh: "服务已更新，等待结算", en: "Service updated; settlement pending" },
  settled: { zh: "已完成", en: "Completed" },
  requote_required: { zh: "需要重新报价", en: "A new quote is required" },
  cancelled: { zh: "已取消", en: "Cancelled" },
  reconciliation_required: { zh: "需要人工核对", en: "Support review required" }
};

function transitionFlowLabel(
  transition: PortalDeferredTransition,
  locale: PortalWalletFirstOrdersLocale
) {
  if (transition.flowKind === "scheduled_switch") {
    return locale === "zh" ? "到期后切换" : "Scheduled switch";
  }
  return locale === "zh" ? "首次开通" : "Initial activation";
}

function transitionDeliveryLabel(
  transition: PortalDeferredTransition,
  locale: PortalWalletFirstOrdersLocale
) {
  const delivery = transition.offer.delivery;
  if (delivery.kind === "subscription_plan") {
    return locale === "zh"
      ? `${delivery.durationDays} 天 · 每月 ${delivery.monthlyTrafficGb} GB`
      : `${delivery.durationDays} days · ${delivery.monthlyTrafficGb} GB monthly`;
  }
  return locale === "zh"
    ? `${delivery.trafficGb} GB · 永不过期`
    : `${delivery.trafficGb} GB · never expires`;
}

function transitionStateLabel(
  transition: PortalDeferredTransition,
  locale: PortalWalletFirstOrdersLocale
) {
  return TRANSITION_STATE_LABELS[transition.state][locale];
}

export type PortalWalletFirstOrdersPanelProps = {
  commerceClient: PortalWalletFirstCommerceClient | null;
  locale: PortalWalletFirstOrdersLocale;
  sessionRef: string | null;
  sessionGeneration?: number;
  onSessionInvalid?: () => void;
};

export function PortalWalletFirstOrdersPanel({
  commerceClient,
  locale,
  sessionRef,
  sessionGeneration = 0,
  onSessionInvalid
}: PortalWalletFirstOrdersPanelProps) {
  const zh = locale === "zh";
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const requestSequenceRef = useRef(0);
  const previousTransitionsRef = useRef<PortalDeferredTransition[]>([]);
  const previousScopeRef = useRef<{
    client: PortalWalletFirstCommerceClient | null;
    sessionRef: string | null;
    sessionGeneration: number;
  }>({ client: null, sessionRef: null, sessionGeneration: -1 });
  const onSessionInvalidRef = useRef(onSessionInvalid);

  useEffect(() => {
    onSessionInvalidRef.current = onSessionInvalid;
  }, [onSessionInvalid]);

  useEffect(() => {
    const scopeChanged = previousScopeRef.current.client !== commerceClient
      || previousScopeRef.current.sessionRef !== sessionRef
      || previousScopeRef.current.sessionGeneration !== sessionGeneration;
    if (scopeChanged) {
      previousScopeRef.current = { client: commerceClient, sessionRef, sessionGeneration };
      previousTransitionsRef.current = [];
    }

    const requestSequence = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestSequence;

    if (!commerceClient || !sessionRef) {
      previousTransitionsRef.current = [];
      setState({ status: "unavailable" });
      return () => {
        if (requestSequenceRef.current === requestSequence) {
          requestSequenceRef.current += 1;
        }
      };
    }

    if (previousTransitionsRef.current.length === 0) {
      setState({ status: "loading" });
    } else {
      setState({
        status: "ready",
        transitions: previousTransitionsRef.current,
        refreshing: true,
        refreshError: false,
        retryable: true
      });
    }

    void commerceClient.listDeferredTransitions({ sessionRef }).then((transitions) => {
      if (requestSequence !== requestSequenceRef.current) return;
      previousTransitionsRef.current = transitions;
      setState({
        status: "ready",
        transitions,
        refreshing: false,
        refreshError: false,
        retryable: true
      });
    }).catch((error: unknown) => {
      if (requestSequence !== requestSequenceRef.current) return;
      const sessionInvalid = error instanceof PortalCoinCommerceClientError
        && error.code === "commerce_session_invalid";
      if (sessionInvalid) onSessionInvalidRef.current?.();
      const retryable = error instanceof PortalCoinCommerceClientError
        ? error.retryable
        : true;
      if (previousTransitionsRef.current.length > 0) {
        setState({
          status: "ready",
          transitions: previousTransitionsRef.current,
          refreshing: false,
          refreshError: true,
          retryable
        });
      } else {
        setState({ status: "error", retryable });
      }
    });

    return () => {
      if (requestSequenceRef.current === requestSequence) {
        requestSequenceRef.current += 1;
      }
    };
  }, [commerceClient, revision, sessionGeneration, sessionRef]);

  const retry = () => setRevision((current) => current + 1);
  const refreshing = state.status === "loading"
    || (state.status === "ready" && state.refreshing);

  return (
    <section
      aria-busy={refreshing || undefined}
      aria-labelledby="portal-wallet-first-orders-history-heading"
      className="portal-marketplace-group portal-wallet-first-transition-queue portal-wallet-first-orders-history"
    >
      <header className="portal-marketplace-group__header">
        <h2 id="portal-wallet-first-orders-history-heading">
          {zh ? "服务切换记录" : "Service transition history"}
        </h2>
        <button
          className="portal-secondary-button compact"
          type="button"
          disabled={!commerceClient || !sessionRef || refreshing}
          onClick={retry}
        >
          {refreshing
            ? (zh ? "正在刷新…" : "Refreshing…")
            : (zh ? "刷新记录" : "Refresh records")}
        </button>
      </header>
      <p className="portal-wallet-first-orders-history__description">
        {zh
          ? "钱包优先模式不生成传统订单号。以下记录直接来自服务端服务切换状态，不代表尚未完成的支付。"
          : "Wallet-first accounts do not create traditional order numbers. These records come directly from server-projected service transitions and do not imply that pending payments are complete."}
      </p>

      {state.status === "loading" ? (
        <p role="status">{zh ? "正在加载服务切换记录…" : "Loading service transition history…"}</p>
      ) : null}
      {state.status === "unavailable" ? (
        <p role="status">{zh ? "服务切换记录暂不可用。" : "Service transition history is unavailable."}</p>
      ) : null}
      {state.status === "error" ? (
        <div className="portal-marketplace-state" role="alert">
          <p>{zh ? "服务切换记录加载失败。" : "Service transition history could not be loaded."}</p>
          {state.retryable ? (
            <button className="portal-secondary-button compact" type="button" onClick={retry}>
              {zh ? "重试" : "Retry"}
            </button>
          ) : null}
        </div>
      ) : null}
      {state.status === "ready" ? (
        <>
          {state.refreshError ? (
            <div className="portal-marketplace-state" role="alert">
              <p>{zh ? "刷新失败，仍保留上次成功加载的记录。" : "Refresh failed. The last successfully loaded records are still shown."}</p>
              {state.retryable ? (
                <button className="portal-secondary-button compact" type="button" onClick={retry}>
                  {zh ? "重试" : "Retry"}
                </button>
              ) : null}
            </div>
          ) : null}
          <section aria-label={zh ? "全部服务切换记录" : "All service transitions"}>
            <h3>{zh ? "全部记录" : "All records"}</h3>
            {state.transitions.length === 0 ? (
              <p role="status">{zh ? "暂无服务切换记录。" : "No service transitions yet."}</p>
            ) : (
              <ul className="portal-deferred-transition-list">
                {state.transitions.map((transition) => (
                  <li
                    className="portal-deferred-transition"
                    data-transition-state={transition.state}
                    key={transition.transitionRef}
                  >
                    <article>
                      <h4>{locale === "zh" ? transition.offer.title.zh : transition.offer.title.en}</h4>
                      <p>{transitionStateLabel(transition, locale)}</p>
                      <dl className="portal-deferred-transition__facts">
                        <div>
                          <dt>{zh ? "执行方式" : "Execution"}</dt>
                          <dd>{transitionFlowLabel(transition, locale)}</dd>
                        </div>
                        <div>
                          <dt>{zh ? "计划时间" : "Scheduled for"}</dt>
                          <dd>{formatPortalDateTime(transition.scheduledFor, locale)}</dd>
                        </div>
                        <div>
                          <dt>{zh ? "套餐规格" : "Delivery"}</dt>
                          <dd>{transitionDeliveryLabel(transition, locale)}</dd>
                        </div>
                        <div>
                          <dt>Coins</dt>
                          <dd>{transition.amountUnits.toLocaleString(zh ? "zh-CN" : "en-US")} Coins</dd>
                        </div>
                        <div>
                          <dt>{zh ? "创建时间" : "Created at"}</dt>
                          <dd>{formatPortalDateTime(transition.createdAt, locale)}</dd>
                        </div>
                        {transition.settledAt ? (
                          <div>
                            <dt>{zh ? "完成时间" : "Settled at"}</dt>
                            <dd>{formatPortalDateTime(transition.settledAt, locale)}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </section>
  );
}
