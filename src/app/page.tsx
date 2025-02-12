import { Metadata } from "next";
import HomeContent from "@/components/HomeContent";

export const metadata: Metadata = {
  title: "DSA Tracker - Home",
  description: "Track your DSA progress across multiple platforms",
};

export default function Home() {
  return <HomeContent />;
} 