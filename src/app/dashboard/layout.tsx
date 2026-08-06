import DashboardLayoutClient from "./layout-client";

export const metadata = {
  title: "Dashboard - Maison Pasha CRM",
  description: "Maison Pasha CRM Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
