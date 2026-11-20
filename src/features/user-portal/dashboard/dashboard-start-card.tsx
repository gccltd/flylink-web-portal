import { Globe2, MonitorSmartphone, Rocket, ShieldCheck, Star } from "lucide-react";

type DashboardStartCardProps = {
  locale: "zh" | "en";
  onStartUsing: () => void;
  recommended?: boolean;
};

export function DashboardStartCard({
  locale,
  onStartUsing,
  recommended = false
}: DashboardStartCardProps) {
  const zh = locale === "zh";

  return (
    <article className="portal-v2-panel portal-v2-dashboard-start">
      <div className="portal-v2-panel-header">
        <div className="portal-dashboard-heading">
          <span className="portal-dashboard-header-icon" aria-hidden="true">{recommended ? <Star /> : <Rocket />}</span>
          <div>
            <span className="portal-card-label">{recommended ? (zh ? "客户端推荐" : "Recommended clients") : (zh ? "使用指南" : "Get started")}</span>
            <h3>{recommended ? (zh ? "推荐使用" : "Recommended") : (zh ? "开始使用" : "Start using")}</h3>
          </div>
        </div>
      </div>
      {recommended ? (
        <>
          <p className="portal-recommend-heading">{zh ? "多端客户端，轻松连接飞连VPN" : "Connect to FlyLink VPN across devices"}</p>
          <p className="portal-recommend-description">{zh ? "根据设备选择客户端，复制订阅链接并按教程完成导入。" : "Choose a client, copy the link, and follow the guide."}</p>
        </>
      ) : <p>{zh ? "已完成购买？立即连接飞连VPN。" : "Already purchased? Connect to FlinkVPN now."}</p>}
      <button className="portal-primary-button" type="button" onClick={onStartUsing}>
        {recommended ? (zh ? "查看使用教程" : "View usage guide") : (zh ? "启动飞连VPN" : "Launch FlinkVPN")}
      </button>
      <ul className="portal-v2-start-points">
        <li><Globe2 aria-hidden="true" />{recommended ? (zh ? "多平台支持" : "Multiple platforms") : (zh ? "全球加速" : "Global acceleration")}</li>
        <li><ShieldCheck aria-hidden="true" />{recommended ? (zh ? "安全连接" : "Secure connection") : (zh ? "稳定安全" : "Stable and secure")}</li>
        <li><MonitorSmartphone aria-hidden="true" />{recommended ? (zh ? "导入指导" : "Import guidance") : (zh ? "多端支持" : "Multi-device support")}</li>
      </ul>
    </article>
  );
}
