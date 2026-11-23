"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/app", label: "This week" },
  { href: "/app/flyer", label: "Flyer" },
  { href: "/app/meals", label: "Meals" },
  { href: "/app/list", label: "List" },
  { href: "/app/preferences", label: "You" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const onLanding = pathname === "/";

  return (
    <header className={onLanding ? "site-header site-header--landing" : "site-header"}>
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden />
          RecipeGain
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {links.map((link) => {
            const active =
              link.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "site-nav__link is-active" : "site-nav__link"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {onLanding && (
          <a href="#start" className="btn btn--primary btn--compact header-cta">
            Get my deals
          </a>
        )}
      </div>
    </header>
  );
}
