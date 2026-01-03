import ResetPasswordClient from "./ResetPasswordClient";

export const metadata = {
  title: "Choose new password | Admin Dashboard",
};

export default function ResetPasswordPage({ searchParams }) {
  const token = searchParams?.token ?? "";
  return <ResetPasswordClient token={token} />;
}
