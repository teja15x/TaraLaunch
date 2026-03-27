import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Assessment Games",
  description: "Play engaging assessment games based on RIASEC, Gardner's Multiple Intelligences, and personality analysis to discover your ideal career.",
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
