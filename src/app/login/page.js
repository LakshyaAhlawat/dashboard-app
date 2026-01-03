import { Suspense } from "react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | Admin Dashboard",
};

// Ensure this route is always rendered dynamically to avoid
// static prerendering issues in some environments.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <>
      <AuthNavbar />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </>
  );
}
