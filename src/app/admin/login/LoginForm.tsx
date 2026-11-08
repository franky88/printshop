"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 min-h-11 w-full rounded-sm border-2 border-ink/20 bg-paper px-3"
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
        className="min-h-12 w-full rounded-full bg-cyan-ink px-6 font-semibold text-white transition-colors hover:bg-ink disabled:bg-ink/30"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
