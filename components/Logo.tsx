export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect x="4" y="22" width="14" height="14" rx="3" fill="#0369a1" />
      <rect x="22" y="22" width="14" height="14" rx="3" fill="#15803d" />
      <rect x="13" y="5" width="14" height="14" rx="3" fill="#b45309" />
    </svg>
  );
}
