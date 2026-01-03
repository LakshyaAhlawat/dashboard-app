import ConsumerOrderForm from "@/app/order/ConsumerOrderForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "New order request | Customer portal",
};

export default async function ConsumerOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/consumer/login");
  }

  return <ConsumerOrderForm />;
}
