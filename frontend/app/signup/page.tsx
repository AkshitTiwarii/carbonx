"use client";

import Link from "next/link";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <form className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-green-700">Sign Up</h1>
        <input type="text" placeholder="Name" className="border p-2 rounded" required />
        <input type="email" placeholder="Email" className="border p-2 rounded" required />
        <input type="password" placeholder="Password" className="border p-2 rounded" required />
        <button className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Create Account</button>
        <p className="text-sm text-center">Already have an account? <Link href="/login" className="text-green-600">Login</Link></p>
      </form>
    </div>
  );
}
