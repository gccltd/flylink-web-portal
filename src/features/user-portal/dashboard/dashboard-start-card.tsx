type DashboardStartCardProps = {
  locale: "zh" | "en";
  onStartUsing: () => void;
};

export function DashboardStartCard({
  locale,
  onStartUsing
}: DashboardStartCardProps) {
  const zh = locale === "zh";

  return (
    <article className="portal-v2-panel portal-v2-dashboard-start">
      <div className="portal-v2-panel-header">
        <div>
          <span className="portal-card-label">{zh ? "开始使用" : "Start using"}</span>
          <h3>{zh ? "开始使用" : "Start using"}</h3>
        </div>
      </div>
      <p>{zh ? "已完成购买？立即连接飞连VPN。" : "Already purchased? Connect to FlinkVPN now."}</p>
      <button className="portal-primary-button" type="button" onClick={onStartUsing}>
        {zh ? "启动飞连VPN" : "Launch FlinkVPN"}
      </button>
      <ul className="portal-v2-start-points">
        <li>{zh ? "全球加速" : "Global acceleration"}</li>
        <li>{zh ? "稳定安全" : "Stable and secure"}</li>
        <li>{zh ? "多端支持" : "Multi-device support"}</li>
      </ul>
    </article>
  );
}
