import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Buddy Chat",
  description: "Chat with your AI Career Buddy to get personalized career guidance, ask questions, and explore career paths.",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
