"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import InAppAuth from "@/components/InAppAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Logging in...");
    try {
      const res = await apiPost<{ token: string }>("/api/auth/login", { email, password });
      setStatus("Logged in");
      // TODO: store token
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 dark:bg-zinc-950">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm w-80 flex flex-col gap-4 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Login</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" required />
        <button className="btn-primary">Login</button>
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">or</span>
          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <InAppAuth />
  <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">Don't have an account? <Link href="/signup" className="text-indigo-600 dark:text-indigo-400">Sign Up</Link></p>
  <p className="text-xs text-zinc-500 dark:text-zinc-400">{status}</p>
      </form>
    </div>
  );
}
