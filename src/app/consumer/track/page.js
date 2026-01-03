import ConsumerOrderTrackerClient from "./ConsumerOrderTrackerClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Track request | Customer portal",
};

export default async function ConsumerTrackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/consumer/login");
  }

  return <ConsumerOrderTrackerClient />;
}
