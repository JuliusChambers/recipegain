"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/app", label: "Week", icon: "◎" },
  { href: "/app/flyer", label: "Flyer", icon: "▤" },
  { href: "/app/meals", label: "Meals", icon: "◉" },
  { href: "/app/list", label: "List", icon: "✓" },
  { href: "/app/preferences", label: "You", icon: "☺" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile">
      {items.map((item) => {
        const active =
          item.href === "/app"
            ? pathname === "/app"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "mobile-nav__item is-active" : "mobile-nav__item"}
          >
            <span className="mobile-nav__icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
