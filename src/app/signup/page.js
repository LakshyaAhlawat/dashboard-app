import AuthNavbar from "@/components/layout/AuthNavbar";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign up | Admin Dashboard",
};

export default function SignupPage() {
  return (
    <>
      <AuthNavbar />
      <SignupForm />
    </>
  );
}
