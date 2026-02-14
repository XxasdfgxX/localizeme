"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <button className="button button-muted">Checking session...</button>;
  }

  if (session?.user) {
    return (
      <div className="button-row">
        <a href="/dashboard" className="button">
          Open Dashboard
        </a>
        <button
          className="button button-muted"
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      className="button"
      onClick={() => {
        signIn("google", { callbackUrl: "/dashboard" });
      }}
    >
      Login with Google
    </button>
  );
}
