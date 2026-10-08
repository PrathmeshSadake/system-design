import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">We could not find that page</h1>
      <p className="mt-4 text-lg text-slate-700">It may have moved, like a toy put back on the wrong shelf.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-sky-800 px-5 py-3 font-semibold text-white hover:bg-sky-900">
        Go to the home page
      </Link>
    </div>
  );
}
