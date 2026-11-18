// Vercel serverless mock API for the desktop portal Preview (PREVIEW ONLY).
//
// This file mirrors the stub set of the lucky local preview server
// (serve-portal.mjs, port 8892) so a Vercel Preview deployment can render
// the full user-center page without a real backend. Everything it returns
// comes from the DESIGN MOCK DATASET ONLY: the numbers in Yi's own design
// screenshot (200 GB annual plan, 70 Coins balance, renewal 200 - 20 credit
// = 180 actual, 110 shortfall). The account is a synthetic preview account
// ("preview-user"), never any real account data. The amounts are rendered
// through the app's own strict server-projection validators, which proves
// the UI renders them; they are NOT Yi's real account state.
//
// Served stubs:
// - GET /api/portal/browser-session -> synthetic preview session
//   (readCookieSession() labels it "authenticated_preview").
// - GET /api/portal/commerce/model -> legacy (one-click renewal is legacy-only).
// - GET /api/portal/access-requests/current -> empty requests + ONE usable
//   "yearly" (200 GB) entitlement, so the hero shows an active plan.
// - GET /api/portal/security/current -> empty security state.
// - GET /api/portal/resources/current -> available 200 GB / 365d resource.
// - GET /api/portal/catalog/offers -> 3 plan offers (50/100/200 GB).
// - GET /api/portal/catalog/offers/:ref -> single offer.
// - GET /api/portal/commerce/plan-switch/state -> current 200 GB offer +
//   current_renew (charge 180, credit 20).
// - POST /api/portal/commerce/checkout-preview -> renewal quote for the
//   200 GB offer (200 / -20 / 180 / 70 / 110, 10-min expiry countdown);
//   plain quotes for the two monthly offers. Unknown offerRef -> 404.
// - GET /api/portal/coins/wallet -> 70 paidCoins summary (hero balance).
// - Any other /api/portal/* -> 503 {"error":"preview-no-backend"}: no orders
//   are created, no payments, no ledger/recharge data. The marketplace,
//   wallet ledger, orders and recharge surfaces therefore stay honestly
//   unavailable instead of showing fabricated business data.
//
// Boundaries: this is NOT a backend. It performs no business calculation
// beyond returning the fixed mock dataset, holds no state, reads no
// credentials, and must never be pointed at production data. The real
// production API adapter will replace it; until then the Preview shows the
// design mock, exactly like the lucky local preview.

// ---- synthetic preview account (design mock dataset, NOT real data) ----
const VALID_UNTIL = "2027-10-14T00:00:00.000Z";
const BALANCE = { bonusCoins: 0, paidCoins: 70, rewardCoins: 0, heldCoins: 0 };

function offer(ref, versionRef, titleZh, titleEn, summaryZh, summaryEn, baseCoins, priceMinor, durationDays, monthlyGb) {
  return {
    offerRef: ref,
    offerVersionRef: versionRef,
    category: "plan",
    title: { zh: titleZh, en: titleEn },
    summary: { zh: summaryZh, en: summaryEn },
    importantNotices: { zh: ["续费后可用时间相应延长。"], en: ["Renewal extends availability accordingly."] },
    baseCoinUnits: baseCoins,
    referencePrice: { currency: "CNY", amountMinor: priceMinor },
    acceptedCoinTypes: ["paid_coins"],
    delivery: {
      kind: "subscription_plan",
      durationDays,
      monthlyTrafficGb: monthlyGb,
      trafficGb: null,
      neverExpires: false,
      discountBasisPoints: 0,
    },
  };
}

const OFFERS = {
  plan_50gb_monthly: offer(
    "plan_50gb_monthly", "plan_50gb_monthly_v1",
    "50 GB 月套餐", "50 GB Monthly Plan",
    "每月 50 GB 流量，有效期 30 天。", "50 GB monthly traffic, valid for 30 days.",
    20, 2000, 30, 50,
  ),
  plan_100gb_monthly: offer(
    "plan_100gb_monthly", "plan_100gb_monthly_v1",
    "100 GB 月套餐", "100 GB Monthly Plan",
    "每月 100 GB 流量，有效期 30 天。", "100 GB monthly traffic, valid for 30 days.",
    30, 3000, 30, 100,
  ),
  plan_200gb_annual: offer(
    "plan_200gb_annual", "plan_200gb_annual_v1",
    "200 GB 年度套餐", "200 GB Annual Plan",
    "每月 200 GB 流量，有效期 365 天。", "200 GB monthly traffic, valid for 365 days.",
    200, 20000, 365, 200,
  ),
};

function renewalQuote() {
  const now = new Date();
  return {
    quoteRef: "quote_preview_renewal_001",
    offer: OFFERS.plan_200gb_annual,
    amountUnits: 180,
    appliedDiscountBasisPoints: 0,
    purchaseAvailability: "insufficient_balance",
    shortfallUnits: 110,
    allocation: [],
    balances: { before: { ...BALANCE }, after: { ...BALANCE } },
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    planSwitch: {
      kind: "renewal",
      creditUnits: 20,
      chargeUnits: 180,
      effectiveAt: null,
      cancelsPendingDowngrade: false,
    },
  };
}

function plainQuote(offerRef) {
  const offer = OFFERS[offerRef];
  const now = new Date();
  const amount = offer.baseCoinUnits;
  return {
    quoteRef: `quote_preview_${offerRef}`,
    offer,
    amountUnits: amount,
    appliedDiscountBasisPoints: 0,
    purchaseAvailability: "available",
    shortfallUnits: 0,
    allocation: [{ coinType: "paid_coins", amountUnits: amount }],
    balances: {
      before: { ...BALANCE },
      after: { ...BALANCE, paidCoins: BALANCE.paidCoins - amount, heldCoins: BALANCE.heldCoins + amount },
    },
    expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
  };
}

function previewSession() {
  const now = new Date();
  const exp = new Date(now.getTime() + 60 * 60 * 1000);
  return {
    sessionRef: `portalctx_${"a".repeat(64)}`,
    transport: "cookie",
    authMethod: "password",
    status: "active",
    issuedAt: now.toISOString(),
    expiresAt: exp.toISOString(),
    userRef: "preview-user",
    displayName: "预览用户",
  };
}

function sendJson(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}

// Vercel parses a JSON body into req.body for Node functions; fall back to
// reading the raw stream when it did not (e.g. a non-JSON content type).
async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const method = req.method;

  if (pathname === "/api/portal/browser-session" && method === "GET") {
    sendJson(res, 200, { session: previewSession() });
    return;
  }
  // The commerce model selects the route family (legacy vs wallet-first).
  // This preview serves the legacy model only, matching the PR #892 review
  // (one-click renewal auto-dialog is legacy-only).
  if (pathname === "/api/portal/commerce/model" && method === "GET") {
    sendJson(res, 200, { commerceModel: "legacy" });
    return;
  }
  // One usable "yearly" entitlement: the hero shows an active 200 GB plan
  // and the "一键续费" button. No subscription requests exist.
  if (pathname === "/api/portal/access-requests/current" && method === "GET") {
    sendJson(res, 200, {
      items: [],
      accountEntitlements: [{
        id: "ent_preview_yearly_001",
        plan: "yearly",
        status: "active",
        usable: true,
        validUntil: VALID_UNTIL,
        quota: { trafficGb: 200 },
      }],
    });
    return;
  }
  if (pathname === "/api/portal/security/current" && method === "GET") {
    sendJson(res, 200, { security: {} });
    return;
  }
  // Active resource backing the hero's plan/traffic display.
  if (pathname === "/api/portal/resources/current" && method === "GET") {
    sendJson(res, 200, {
      resource: {
        state: "available",
        plan: { id: "yearly", durationDays: 365, monthlyTrafficGb: 200 },
        validUntil: VALID_UNTIL,
        setupAvailable: false,
      },
    });
    return;
  }
  // Marketplace catalog: the three plan offers from the design mock.
  if (pathname === "/api/portal/catalog/offers" && method === "GET") {
    sendJson(res, 200, { offers: Object.values(OFFERS) });
    return;
  }
  const offerMatch = pathname.match(/^\/api\/portal\/catalog\/offers\/([a-z0-9_]+)$/);
  if (offerMatch && method === "GET") {
    const found = OFFERS[offerMatch[1]];
    if (!found) {
      sendJson(res, 404, { error: "preview-no-such-offer" });
      return;
    }
    sendJson(res, 200, { offer: found });
    return;
  }
  // Plan-switch state: current = 200 GB offer, renewal 200 - 20 = 180.
  if (pathname === "/api/portal/commerce/plan-switch/state" && method === "GET") {
    sendJson(res, 200, {
      current: { offerRef: "plan_200gb_annual", validUntil: VALID_UNTIL },
      pendingSwitch: null,
      offers: [{
        offerRef: "plan_200gb_annual",
        action: "current_renew",
        chargeUnits: 180,
        creditUnits: 20,
        effectiveAt: null,
        reasonCode: null,
      }],
    });
    return;
  }
  // Renewal / purchase quote. Renewal of the 200 GB plan carries the six
  // design-mock amount lines (200 / -20 / 180 / 70 / 110, 10-min expiry);
  // the monthly offers get plain available quotes. Nothing here can be
  // purchased: POST /api/portal/commerce/orders below stays 503.
  if (pathname === "/api/portal/commerce/checkout-preview" && method === "POST") {
    const body = await readJsonBody(req);
    const offerRef = typeof body.offerRef === "string" ? body.offerRef : null;
    if (!offerRef || !OFFERS[offerRef]) {
      sendJson(res, 404, { error: "preview-no-such-offer" });
      return;
    }
    const quote = offerRef === "plan_200gb_annual" ? renewalQuote() : plainQuote(offerRef);
    sendJson(res, 200, { quote });
    return;
  }
  // Wallet summary: 70 paid Coins (hero balance card). Ledger and recharge
  // offers stay 503, so the wallet page shows its honest unavailable states.
  if (pathname === "/api/portal/coins/wallet" && method === "GET") {
    sendJson(res, 200, {
      wallet: {
        status: "active",
        version: 1,
        balances: { paidCoins: 70, bonusCoins: 0, rewardCoins: 0 },
        spendableUnits: 70,
        heldUnits: 0,
        pendingUnits: 0,
      },
    });
    return;
  }
  // Any other /api/portal/* -> 503: no orders are created, no payments,
  // no ledger/recharge data.
  sendJson(res, 503, { error: "preview-no-backend" });
}
