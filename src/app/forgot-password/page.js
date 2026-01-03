import AuthNavbar from "@/components/layout/AuthNavbar";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "Forgot password | Admin Dashboard",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <AuthNavbar />
      <ForgotPasswordClient />
    </>
  );
}
