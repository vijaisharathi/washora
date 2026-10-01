import { ProviderNavigationItem } from "@/types/provider";

export const PROVIDER_MAIN_NAV: ProviderNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/provider",
    icon: "dashboard",
    isExact: true,
  },
  {
    label: "Orders & Schedule",
    href: "/provider/orders",
    icon: "event_note",
  },
  {
    label: "Service Catalog",
    href: "/provider/services",
    icon: "cleaning_services",
  },
  {
    label: "Earnings & Payouts",
    href: "/provider/earnings",
    icon: "payments",
  },
  {
    label: "Reviews & Ratings",
    href: "/provider/reviews",
    icon: "star",
  },
];

export const PROVIDER_SECONDARY_NAV: ProviderNavigationItem[] = [
  {
    label: "Studio Settings",
    href: "/provider/settings",
    icon: "settings",
  },
  {
    label: "Partner Help & Support",
    href: "/provider/support",
    icon: "help",
  },
];

export const PROVIDER_MOBILE_NAV: ProviderNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/provider",
    icon: "dashboard",
    isExact: true,
  },
  {
    label: "Orders",
    href: "/provider/orders",
    icon: "event_note",
  },
  {
    label: "Services",
    href: "/provider/services",
    icon: "cleaning_services",
  },
  {
    label: "Earnings",
    href: "/provider/earnings",
    icon: "payments",
  },
  {
    label: "Profile",
    href: "/provider/settings",
    icon: "person",
  },
];
