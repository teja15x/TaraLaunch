import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your career assessment results, progress, and personalized recommendations on your Career Agent dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
