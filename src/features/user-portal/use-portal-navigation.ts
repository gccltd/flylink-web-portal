import { useCallback, useEffect, useState } from "react";
import {
  readPortalLocation,
  writePortalLocation,
  type PortalLocation
} from "./portal-browser-session";
import type { PortalSession } from "./user-portal-types";

export type PortalView = PortalLocation["view"];
export type PortalOrderFilter = PortalLocation["orderFilter"];
export type PortalProfileSubview = PortalLocation["profileSubview"];

export function usePortalNavigation(session: PortalSession | null) {
  const [activeView, setActiveView] = useState<PortalView>(() => readPortalLocation().view);
  const [orderCenterFilter, setOrderCenterFilter] = useState<PortalOrderFilter>(
    () => readPortalLocation().orderFilter
  );
  const [personalCenterSubview, setPersonalCenterSubview] = useState<PortalProfileSubview>(
    () => readPortalLocation().profileSubview
  );
  const [topbarUserMenuOpen, setTopbarUserMenuOpen] = useState(false);

  useEffect(() => {
    if (session) {
      writePortalLocation({
        view: activeView,
        orderFilter: orderCenterFilter,
        profileSubview: personalCenterSubview
      });
    }
  }, [activeView, orderCenterFilter, personalCenterSubview, session]);

  const navigatePortalView = useCallback((view: PortalView) => {
    setOrderCenterFilter("all");
    if (view === "profile") {
      setPersonalCenterSubview("profile");
    }
    setActiveView(view);
  }, []);

  const navigatePortalOrderFilter = useCallback((filter: PortalOrderFilter) => {
    setOrderCenterFilter(filter);
    setActiveView("orders");
  }, []);

  return {
    activeView,
    setActiveView,
    orderCenterFilter,
    setOrderCenterFilter,
    personalCenterSubview,
    setPersonalCenterSubview,
    topbarUserMenuOpen,
    setTopbarUserMenuOpen,
    navigatePortalView,
    navigatePortalOrderFilter
  };
}
