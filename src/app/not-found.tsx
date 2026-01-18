import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="text-title">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/"
          className="inline-block mt-4 text-sm underline opacity-80 hover:opacity-100"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
