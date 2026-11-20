import { useEffect, useRef, useState } from "react";
import {
  BookOpen, Cat, Copy, Download, ExternalLink, Infinity as InfinityIcon,
  Info, Link2, MoreHorizontal, QrCode, Rocket, RotateCcw, ScanLine,
  ShieldCheck, Workflow
} from "lucide-react";
import { ModalFrame } from "../../../shared/public/modal-frame";
import { copyText } from "../../../shared/public/clipboard";
import { createSubscriptionResetRecovery } from "../subscription-reset-recovery";

type Props = {
  locale: "zh" | "en";
  initialUrl: string;
  userRef: string | null;
  requestRef: string | null;
  canReveal: boolean;
  canReset: boolean;
  walletFirstAccount: boolean;
  onReveal: () => Promise<string | null>;
  onReset: (idempotencyKey: string, requestRef: string) => Promise<string>;
  onOpenGuide: () => void;
  onOpenMarketplace: () => void;
};

const clients = [
  { id: "shadowrocket", name: "Shadowrocket", icon: Rocket },
  { id: "clash", name: "Clash", icon: Cat },
  { id: "v2rayng", name: "v2rayNG", icon: Workflow },
  { id: "clash-meta", name: "Clash Meta", icon: InfinityIcon }
] as const;

/** No automatic credential POST: only explicit user interaction may reveal or reset. */
export function DashboardSubscriptionCard({
  locale, initialUrl, userRef, requestRef, canReveal, canReset, walletFirstAccount,
  onReveal, onReset, onOpenGuide, onOpenMarketplace
}: Props) {
  const zh = locale === "zh";
  const t = (cn: string, en: string) => zh ? cn : en;
  const [url, setUrl] = useState(initialUrl);
  const [qrImage, setQrImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetKey, setResetKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [resetRecovery] = useState(createSubscriptionResetRecovery);
  const mounted = useRef(true);
  const inFlight = useRef(false);
  const qrSection = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setQrImage("");
    if (url) {
      void import("qrcode").then(({ default: QRCode }) =>
        QRCode.toDataURL(url, { width: 260, margin: 2, errorCorrectionLevel: "M" })
      ).then(image => {
        if (!cancelled) setQrImage(image);
      }).catch(() => {
        if (!cancelled) setQrImage("");
      });
    }
    return () => { cancelled = true; };
  }, [url]);

  async function reveal(): Promise<string | null> {
    setMenuOpen(false);
    if (!canReveal) { onOpenGuide(); return null; }
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    try {
      const next = await onReveal();
      if (!mounted.current) return null;
      if (!next) {
        setMessage(t("暂无法读取链接，请稍后重试。", "Could not read your link. Try again."));
        return null;
      }
      setUrl(next);
      setCopied(false);
      return next;
    } catch {
      if (mounted.current) setMessage(t("读取失败，请在使用指南中检查订阅状态。", "Read failed. Check the guide."));
      return null;
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function copy(value = url): Promise<boolean> {
    if (!value) {
      setMessage(t("请通过“更多 → 查看订阅”取得链接。", "Choose More → View subscription first."));
      return false;
    }
    try {
      if (!(await copyText(value))) throw new Error("clipboard_unavailable");
      if (mounted.current) {
        setCopied(true);
        setMessage(t("订阅链接已复制，请在客户端中导入。", "Link copied. Import it into your client."));
      }
      return true;
    } catch {
      if (mounted.current) setMessage(t("复制失败，请手动选择链接复制。", "Copy failed. Select the link manually."));
      return false;
    }
  }

  async function revealQr() {
    if (!url) await reveal();
    qrSection.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }

  function openReset() {
    setMenuOpen(false);
    if (!canReset || !requestRef || !userRef) {
      setMessage(t("当前资源不能在此重置，请在使用指南中管理。", "Manage reset through the guide."));
      return;
    }
    const old = resetRecovery.read({ userRef, requestRef });
    const next = old?.key ?? globalThis.crypto?.randomUUID?.();
    if (!next) {
      setMessage(t("浏览器无法安全创建重置请求。", "Browser cannot securely create a reset request."));
      return;
    }
    setResetKey(next);
    setResetOpen(true);
    setMessage("");
  }

  async function confirmReset() {
    if (!resetKey || !requestRef || !userRef || !canReset || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setMessage("");
    setUrl(""); // Old token may already be invalidated even after a timeout.
    setQrImage("");
    setCopied(false);
    const scope = { userRef, requestRef };
    const saved = resetRecovery.save(scope, resetKey);
    try {
      const next = await onReset(resetKey, requestRef);
      if (!mounted.current) return;
      resetRecovery.clear(scope, resetKey);
      setUrl(next);
      setResetOpen(false);
      setResetKey(null);
      setMessage(t("链接已重置，请重新复制并导入。", "Link reset. Copy and import the new one."));
    } catch {
      if (mounted.current) setMessage(t(
        saved
          ? "重置结果未确认。旧链接可能已失效，请重试同一次操作。"
          : "重置结果未确认，恢复键仅留在本页。请重试同一次操作。",
        "Reset unconfirmed; the old link may be invalid. Retry the same operation."
      ));
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function importClient() {
    // Do not fabricate client deep-link schemes or put secret URLs in navigation.
    let value = url;
    if (!value) {
      const revealed = await reveal();
      if (!revealed) return;
      value = revealed;
    }
    if (await copy(value)) onOpenGuide();
  }

  return (
    <article className="portal-v2-panel portal-v2-dashboard-marketplace portal-v2-dashboard-subscription">
      <div className="portal-v2-panel-header">
        <div className="portal-dashboard-heading">
          <span className="portal-dashboard-header-icon" aria-hidden="true"><Link2 /></span>
          <div>
            <span className="portal-card-label">{t("连接管理", "Connection management")}</span>
            <h3>{t("订阅链接", "Subscription link")}</h3>
          </div>
        </div>
        <button className="portal-link-button" type="button" onClick={onOpenMarketplace}>
          {t("去商城", "Marketplace")} <ExternalLink aria-hidden="true" />
        </button>
      </div>
      <p className="portal-subscription-intro">
        {t("管理订阅链接，复制或扫码后即可在客户端中导入配置。", "Copy or scan the link to import your configuration.")}
      </p>
      <section className="portal-subscription-link-box" aria-label={t("我的订阅链接", "My subscription link")}>
        <div className="portal-subscription-link-header">
          <strong>{t("我的订阅链接", "My subscription link")}</strong>
          <span className="portal-subscription-link-status"><ShieldCheck aria-hidden="true" />
            {walletFirstAccount ? t("需显式交付", "Explicit setup")
              : canReveal ? t("可查看", "Available") : t("待开通", "Not ready")}
          </span>
        </div>
        <div className="portal-subscription-link-actions">
          <label className="portal-subscription-url-field">
            <Link2 aria-hidden="true" />
            <span className="sr-only">{t("订阅链接文本", "Subscription URL")}</span>
            <input aria-label={t("订阅链接文本", "Subscription URL")} readOnly
              type="text" spellCheck={false} autoComplete="off" value={url}
              placeholder={walletFirstAccount
                ? t("请在使用指南中生成并确认配置", "Use the guide for explicit setup")
                : t("通过“更多”查看订阅链接", "Use More to view the link")} />
          </label>
          <button className="portal-subscription-action primary" type="button" disabled={busy || !url}
            onClick={() => void copy()}><Copy aria-hidden="true" />{copied ? t("已复制", "Copied") : t("复制", "Copy")}</button>
          <button className="portal-subscription-action" type="button" disabled={busy || !canReset}
            onClick={openReset}><RotateCcw aria-hidden="true" />{t("重置", "Reset")}</button>
          <button className="portal-subscription-action" type="button" disabled={busy}
            onClick={() => void revealQr()}><QrCode aria-hidden="true" />{t("二维码", "QR code")}</button>
          <div className="portal-subscription-more">
            <button type="button" className="portal-subscription-action icon" aria-label={t("更多订阅操作", "More subscription actions")}
              aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>
              <MoreHorizontal aria-hidden="true" />{t("更多", "More")}
            </button>
            {menuOpen ? (
              <div className="portal-subscription-menu" role="group" aria-label={t("更多订阅操作", "More subscription actions")}
                onKeyDown={event => { if (event.key === "Escape") setMenuOpen(false); }}>
                <button type="button" disabled={busy} onClick={() => void reveal()}>
                  <Link2 aria-hidden="true" />{t("查看订阅", "View subscription")}
                </button>
                <button type="button" disabled={!canReset || busy} onClick={openReset}>
                  <RotateCcw aria-hidden="true" />{t("重置订阅链接", "Reset subscription link")}
                </button>
                <button type="button" onClick={() => { setMenuOpen(false); onOpenGuide(); }}>
                  <BookOpen aria-hidden="true" />{t("使用教程", "Usage guide")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {message ? <p className="portal-subscription-message" role="status">{message}</p> : null}
        {busy ? <p className="portal-subscription-message" role="status">{t("处理中，请勿重复操作…", "Processing…")}</p> : null}
      </section>
      <div className="portal-subscription-workspace">
        <div className="portal-subscription-qr-panel" ref={qrSection}>
          <div className="portal-subscription-section-heading"><ScanLine aria-hidden="true" />
            <div><strong>{t("扫码导入订阅", "Scan to import")}</strong>
              <small>{t("使用客户端扫描二维码添加配置。", "Scan in your client to add the configuration.")}</small>
            </div>
          </div>
          <div className="portal-subscription-qr-image">
            {qrImage ? <img src={qrImage} alt={t("当前订阅链接二维码", "Subscription QR code")} />
              : <div className="portal-subscription-qr-placeholder">
                <QrCode aria-hidden="true" /><span>{url ? t("正在生成二维码", "Generating QR")
                  : t("查看链接后生成二维码", "View link to generate QR")}</span>
              </div>}
          </div>
          {qrImage ? (
            <a className="portal-subscription-qr-download" download="flylink-subscription-qr.png"
              href={qrImage}><Download aria-hidden="true" />{t("保存二维码", "Save QR code")}</a>
          ) : (
            <button className="portal-subscription-qr-download" type="button" disabled={busy}
              onClick={() => void revealQr()}><QrCode aria-hidden="true" />{t("查看二维码", "View QR code")}</button>
          )}
        </div>
        <div className="portal-subscription-import-panel">
          <div className="portal-subscription-section-heading"><Rocket aria-hidden="true" />
            <div><strong>{t("导入到客户端", "Import into client")}</strong>
              <small>{t("选择客户端，复制链接后打开导入指南。", "Copy the link, then follow the import guide.")}</small>
            </div>
          </div>
          <div className="portal-subscription-client-grid">
            {clients.map(({ id, name, icon: Icon }) => (
              <button type="button" className="portal-subscription-client" key={id} disabled={busy}
                aria-label={t("复制订阅并查看 " + name + " 导入教程", "Copy link and open " + name + " guide")}
                onClick={() => void importClient()}>
                <Icon aria-hidden="true" /><span>{name}</span>
              </button>
            ))}
            <button className="portal-subscription-client more-clients" type="button" onClick={onOpenGuide}>
              <MoreHorizontal aria-hidden="true" /><span>{t("更多客户端", "More clients")}</span>
            </button>
          </div>
          <p className="portal-subscription-import-disclaimer">{t(
            "客户端导入方式各异。本操作复制链接并打开指南，不会虚报自动导入成功。",
            "Import differs by client. This action copies the link and opens the guide."
          )}</p>
        </div>
      </div>
      <div className="portal-subscription-hint">
        <Info aria-hidden="true" />
        <div><strong>{t("使用提示", "Usage tip")}</strong>
          <span>{t("请勿公开订阅链接或二维码；重置后旧链接失效，需重新导入。", "Keep links and QR codes private. Resetting invalidates the old link.")}</span>
        </div>
      </div>
      {resetOpen ? <ModalFrame title={t("确认重置订阅链接", "Confirm subscription reset")}
        titleId="portal-subscription-reset-confirm" closeLabel={t("关闭", "Close")}
        closeDisabled={busy} onClose={() => setResetOpen(false)}
        footer={<>
          <button type="button" className="portal-secondary-button" disabled={busy} onClick={() => setResetOpen(false)}>
            {t("取消", "Cancel")}</button>
          <button type="button" className="portal-primary-button" disabled={busy}
            onClick={() => void confirmReset()}>{t("确认重置", "Confirm reset")}</button>
        </>}>
        <p>{t("重置将立即使旧链接失效，客户端需要重新导入。已使用的流量不会清零。",
          "Resetting invalidates the old URL; re-import the new one. Usage is not reset.")}</p>
        {message ? <p className="portal-error" role="alert">{message}</p> : null}
      </ModalFrame> : null}
    </article>
  );
}
