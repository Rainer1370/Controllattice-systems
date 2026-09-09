type Page = "home" | "products" | "work" | "ai" | "about" | "staff" | "contact";

function Mark() { return <svg className="mark" viewBox="0 0 100 100" aria-hidden="true"><path d="M50 5 88 27v46L50 95 12 73V27Z"/><path d="M64 29a27 27 0 1 0 0 42M48 26v48l27 15M48 50l40-23"/><circle cx="48" cy="50" r="4"/><circle cx="88" cy="27" r="3"/><circle cx="75" cy="89" r="3"/></svg>; }
export function Brand() { return <span className="brand"><Mark/><span><strong>CONTROL<i>LATTICE</i></strong><small>SYSTEMS</small></span></span>; }

const links: { key: Page; label: string; href: string }[] = [
  { key: "home", label: "Home", href: "/" },
  { key: "products", label: "Solutions", href: "/products" },
  { key: "work", label: "Technical Briefs", href: "/work" },
  { key: "ai", label: "Practical AI", href: "/ai" },
  { key: "about", label: "About", href: "/about" },
  { key: "staff", label: "Staff", href: "/staff" },
  { key: "contact", label: "Contact", href: "/contact" },
];

export function SiteHeader({ active }: { active: Page }) { return <header className="nav shell"><Link href="/" aria-label="Control Lattice Systems home"><Brand/></Link><nav aria-label="Primary navigation">{links.map(link => <Link key={link.key} href={link.href} aria-current={active === link.key ? "page" : undefined}>{link.label}</Link>)}</nav>{active !== "contact" && <Link className="button small" href="/contact">Start a conversation</Link>}</header>; }
export function SiteFooter() { return <footer className="shell"><Link href="/" aria-label="Control Lattice Systems home"><Brand/></Link><p>Controls · Diagnostics · Digital Twins · AI · Infrastructure<br/><span>Engineering complexity. Enabling discovery.</span></p><p>© 2026 Control Lattice Systems</p></footer>; }
import Link from "next/link";
