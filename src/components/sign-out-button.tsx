"use client";

import { signOut } from "next-auth/react";
import type { ReactNode } from "react";

type SignOutButtonProps = {
  children?: ReactNode;
  className?: string;
  title?: string;
};

export function SignOutButton({ children, className, title }: SignOutButtonProps) {
  return (
    <button
      className={className || "rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"}
      onClick={() => signOut({ callbackUrl: "/" })}
      type="button"
      title={title}
    >
      {children || "Sign out"}
    </button>
  );
}
