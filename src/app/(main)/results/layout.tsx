import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Results",
  description: "View your personalized career assessment results and detailed insights about career paths that match your profile.",
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
