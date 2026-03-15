"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
