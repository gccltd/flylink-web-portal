import { Plus, WalletCards } from "lucide-react";

type DashboardWalletCardProps = {
  locale: "zh" | "en";
  walletBalance: number | null;
  onOpenWallet: () => void;
};

export function DashboardWalletCard({
  locale,
  walletBalance,
  onOpenWallet
}: DashboardWalletCardProps) {
  const zh = locale === "zh";

  return (
    <article className="portal-v2-panel portal-v2-dashboard-wallet">
      <div className="portal-v2-panel-header">
        <div>
          <span className="portal-card-label">{zh ? "钱包余额" : "Wallet balance"}</span>
          <h3>{zh ? "账户 Coins" : "Account Coins"}</h3>
        </div>
        <WalletCards aria-hidden="true" />
      </div>
      <div className="portal-v2-dashboard-wallet-balance">
        <strong>{walletBalance === null ? "—" : walletBalance}</strong>
        <span>Coins</span>
      </div>
      <p>{zh ? "可用于套餐续费、购买与抵扣。" : "Use Coins for renewals, purchases, and credits."}</p>
      <button className="portal-primary-button compact" type="button" onClick={onOpenWallet}>
        <Plus aria-hidden="true" />
        {zh ? "去充值" : "Top up"}
      </button>
    </article>
  );
}
