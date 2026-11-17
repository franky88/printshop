"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-base">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 min-h-11 w-full rounded-lg border border-ink/50 bg-paper px-3"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="button-primary w-full"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
