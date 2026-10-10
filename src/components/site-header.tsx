import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header page-shell">
      <Link className="brand" href="/" aria-label="CivicFix home">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" role="presentation">
            <path d="M20 3.5 35 12v16L20 36.5 5 28V12L20 3.5Z" fill="currentColor" />
            <path d="M20 12v16M12 20h16" stroke="#fffdf7" strokeWidth="3.2" strokeLinecap="round" />
          </svg>
        </span>
        <span className="brand-name">civic<span>fix</span></span>
      </Link>
      <nav className="main-nav" aria-label="Main navigation">
        <Link href="/issues">Explore reports</Link>
        <Link className="nav-report" href="/report">Report an issue <span aria-hidden="true">+</span></Link>
        <Link className="nav-admin" href="/admin">Admin preview <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
