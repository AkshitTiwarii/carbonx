import Head from 'next/head';
import Link from 'next/link';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Head>
        <title>Login | CarbonX</title>
      </Head>
      <form className="bg-white p-8 rounded shadow-md w-80 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-green-700">Login</h1>
        <input type="email" placeholder="Email" className="border p-2 rounded" required />
        <input type="password" placeholder="Password" className="border p-2 rounded" required />
        <button className="bg-green-600 text-white py-2 rounded hover:bg-green-700">Login</button>
        <p className="text-sm text-center">Don't have an account? <Link href="/signup" className="text-blue-600">Sign Up</Link></p>
      </form>
    </div>
  );
}
