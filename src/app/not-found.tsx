import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <h1 className="text-2xl font-semibold">That page doesn’t exist</h1>
      <Link href="/" className="font-semibold text-blue-soft hover:underline">
        Go to home
      </Link>
    </div>
  );
}
