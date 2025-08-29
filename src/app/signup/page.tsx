"use client";

import Link from "next/link";
import { useState } from "react";
import { apiPost } from "@/lib/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Creating account...");
    try {
      await apiPost("/api/auth/signup", { name, email, password });
      setStatus("Account created. You can login now.");
    } catch (e: any) {
      setStatus(e.message);
    }
  }

  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 dark:bg-zinc-950">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm w-80 flex flex-col gap-4 dark:bg-zinc-900 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Sign Up</h1>
        <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Name" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="border p-2 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100" required />
        <button className="btn-primary">Create Account</button>
  <p className="text-sm text-center text-zinc-700 dark:text-zinc-300">Already have an account? <Link href="/login" className="text-indigo-600 dark:text-indigo-400">Login</Link></p>
  <p className="text-xs text-zinc-500 dark:text-zinc-400">{status}</p>
      </form>
    </div>
  );
}
