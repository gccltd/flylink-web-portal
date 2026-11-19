import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PortalCoinCommerceClientError,
  type PortalCoinCommerceClient,
  type PortalCoinOrder
} from "../commerce";
import {
  PortalRechargeClientError,
  type PortalRechargeClient,
  type PortalRechargeOrder
} from "../recharge";
import {
  buildPortalOrderCenterItems,
  type PortalServiceOrder
} from "../orders/portal-order-center-model";
import type { PortalPaymentOrder } from "../user-portal-client";

export type PortalDashboardActivityPhase = "loading" | "ready" | "partial" | "error";

type RemoteState = {
  sessionRef: string | null;
  sessionGeneration: number;
  phase: PortalDashboardActivityPhase;
  coinOrders: PortalCoinOrder[];
  rechargeOrders: PortalRechargeOrder[];
  retryable: boolean;
};

function isSessionInvalid(error: unknown) {
  return (
    error instanceof PortalCoinCommerceClientError
    && error.code === "commerce_session_invalid"
  ) || (
    error instanceof PortalRechargeClientError
    && error.code === "payment_recharge_session_invalid"
  );
}

function isRetryable(error: unknown) {
  if (
    error instanceof PortalCoinCommerceClientError
    || error instanceof PortalRechargeClientError
  ) {
    return error.retryable;
  }
  return true;
}

export function usePortalDashboardRecentActivity(input: {
  commerceClient: PortalCoinCommerceClient | null;
  rechargeClient: PortalRechargeClient | null;
  enableCoinOrders: boolean;
  legacyPaymentOrders: PortalPaymentOrder[];
  serviceOrders: PortalServiceOrder[];
  sessionRef: string | null;
  sessionGeneration: number;
  onSessionInvalid: () => void;
}) {
  const {
    commerceClient,
    rechargeClient,
    enableCoinOrders,
    legacyPaymentOrders,
    serviceOrders,
    sessionRef,
    sessionGeneration,
    onSessionInvalid
  } = input;
  const [revision, setRevision] = useState(0);
  const [remoteState, setRemoteState] = useState<RemoteState>({
    sessionRef: null,
    sessionGeneration: -1,
    phase: "loading",
    coinOrders: [],
    rechargeOrders: [],
    retryable: false
  });
  const requestIdRef = useRef(0);
  const onSessionInvalidRef = useRef(onSessionInvalid);

  useEffect(() => {
    onSessionInvalidRef.current = onSessionInvalid;
  }, [onSessionInvalid]);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    let active = true;
    const coinRequest = enableCoinOrders && commerceClient && sessionRef
      ? commerceClient.listOrders({ sessionRef, limit: 25 })
      : null;
    const rechargeRequest = rechargeClient && sessionRef
      ? rechargeClient.listOrders({ sessionRef })
      : null;

    if (!coinRequest && !rechargeRequest) {
      setRemoteState({
        sessionRef,
        sessionGeneration,
        phase: "ready",
        coinOrders: [],
        rechargeOrders: [],
        retryable: false
      });
      return () => {
        active = false;
        if (requestIdRef.current === requestId) requestIdRef.current += 1;
      };
    }

    setRemoteState({
      sessionRef,
      sessionGeneration,
      phase: "loading",
      coinOrders: [],
      rechargeOrders: [],
      retryable: false
    });

    const coinTask = coinRequest
      ? coinRequest
        .then((value) => ({ status: "fulfilled" as const, value }))
        .catch((reason: unknown) => ({ status: "rejected" as const, reason }))
      : Promise.resolve({ status: "skipped" as const });
    const rechargeTask = rechargeRequest
      ? rechargeRequest
        .then((value) => ({ status: "fulfilled" as const, value }))
        .catch((reason: unknown) => ({ status: "rejected" as const, reason }))
      : Promise.resolve({ status: "skipped" as const });

    void Promise.all([coinTask, rechargeTask]).then(([coinResult, rechargeResult]) => {
      if (!active || requestIdRef.current !== requestId) return;

      const coinOrders = coinResult.status === "fulfilled" ? coinResult.value.orders : [];
      const rechargeOrders = rechargeResult.status === "fulfilled" ? rechargeResult.value : [];
      const failures: unknown[] = [];
      let successfulSources = 0;

      if (coinResult.status === "fulfilled") successfulSources += 1;
      else if (coinResult.status === "rejected") failures.push(coinResult.reason);

      if (rechargeResult.status === "fulfilled") successfulSources += 1;
      else if (rechargeResult.status === "rejected") failures.push(rechargeResult.reason);

      if (failures.some(isSessionInvalid)) {
        onSessionInvalidRef.current();
        return;
      }

      const hasLocalOrders = legacyPaymentOrders.length > 0 || serviceOrders.length > 0;
      const phase: PortalDashboardActivityPhase = failures.length === 0
        ? "ready"
        : successfulSources > 0 || hasLocalOrders
          ? "partial"
          : "error";

      setRemoteState({
        sessionRef,
        sessionGeneration,
        phase,
        coinOrders,
        rechargeOrders,
        retryable: failures.some(isRetryable)
      });
    });

    return () => {
      active = false;
      if (requestIdRef.current === requestId) requestIdRef.current += 1;
    };
  }, [
    commerceClient,
    enableCoinOrders,
    legacyPaymentOrders,
    rechargeClient,
    revision,
    serviceOrders,
    sessionGeneration,
    sessionRef
  ]);

  const ownsRemoteState = remoteState.sessionRef === sessionRef
    && remoteState.sessionGeneration === sessionGeneration;
  const hasRemoteSource = Boolean(
    sessionRef && ((enableCoinOrders && commerceClient) || rechargeClient)
  );
  const phase = ownsRemoteState
    ? remoteState.phase
    : hasRemoteSource ? "loading" : "ready";
  const items = useMemo(() => buildPortalOrderCenterItems({
    coinOrders: ownsRemoteState ? remoteState.coinOrders : [],
    rechargeOrders: ownsRemoteState ? remoteState.rechargeOrders : [],
    legacyPaymentOrders,
    serviceOrders
  }), [
    legacyPaymentOrders,
    ownsRemoteState,
    remoteState.coinOrders,
    remoteState.rechargeOrders,
    serviceOrders
  ]);
  const retry = useCallback(() => {
    setRevision((value) => value + 1);
  }, []);

  return {
    items,
    phase,
    retryable: ownsRemoteState && remoteState.retryable,
    retry
  };
}
