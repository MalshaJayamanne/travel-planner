import { redirect } from "next/navigation";

// /auth/login → redirect to /auth (login is the default mode)
export default function LoginPage() {
  redirect("/auth");
}
