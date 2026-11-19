import { Globe2, MonitorSmartphone, Rocket, ShieldCheck } from "lucide-react";

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
        <div className="portal-dashboard-heading">
          <span className="portal-dashboard-header-icon" aria-hidden="true"><Rocket /></span>
          <div>
            <span className="portal-card-label">{zh ? "使用指南" : "Get started"}</span>
            <h3>{zh ? "开始使用" : "Start using"}</h3>
          </div>
        </div>
      </div>
      <p>{zh ? "已完成购买？立即连接飞连VPN。" : "Already purchased? Connect to FlinkVPN now."}</p>
      <button className="portal-primary-button" type="button" onClick={onStartUsing}>
        {zh ? "启动飞连VPN" : "Launch FlinkVPN"}
      </button>
      <ul className="portal-v2-start-points">
        <li><Globe2 aria-hidden="true" />{zh ? "全球加速" : "Global acceleration"}</li>
        <li><ShieldCheck aria-hidden="true" />{zh ? "稳定安全" : "Stable and secure"}</li>
        <li><MonitorSmartphone aria-hidden="true" />{zh ? "多端支持" : "Multi-device support"}</li>
      </ul>
    </article>
  );
}
