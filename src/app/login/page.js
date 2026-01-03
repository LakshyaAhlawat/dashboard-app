import { Suspense } from "react";
import AuthNavbar from "@/components/layout/AuthNavbar";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | Admin Dashboard",
};

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
