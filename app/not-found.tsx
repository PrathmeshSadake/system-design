import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-[640px] justify-items-center px-[var(--gutter)] py-28 text-center">
      <p className="mono-label">404</p>
      <h1 className="page-h1">
        This page is <span className="kid">not on the shelf.</span>
      </h1>
      <p className="lede">It may have moved, like a toy put back in the wrong box.</p>
      <Link href="/" className="btn btn-primary mt-8">
        Go home
      </Link>
    </div>
  );
}
