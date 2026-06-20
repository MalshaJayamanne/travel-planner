import { redirect } from "next/navigation";

// /auth/register → redirect to /auth?mode=register (pre-selects the register tab)
export default function RegisterPage() {
  redirect("/auth?mode=register");
}
