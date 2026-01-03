import ConsumerOrderForm from "./ConsumerOrderForm";

export const metadata = {
  title: "Request an order | Admin Dashboard",
};

export default function OrderPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-slate-50">
      <ConsumerOrderForm />
    </main>
  );
}
