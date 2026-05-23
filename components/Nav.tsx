"use client";

// Site header — identical on every public page. Active route is highlighted
// via usePathname so we don't have to thread an `active` prop through pages.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";
import { Wordmark } from "@/components/Wordmark";
import { IconArrowRight } from "@/components/icons";
import { cn } from "@/lib/utils";

const NAV_LINKS = [{ href: "/listings", label: "Rentals" }];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-line">
      <Container>
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="text-forest text-[22px]" aria-label="Frently home">
            <Wordmark />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[14px] text-body">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn("hover:text-ink transition", active && "text-ink font-medium")}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex h-10 px-4 text-[14px] font-medium text-body hover:text-ink rounded-full transition items-center"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-forest text-white text-[14px] font-medium hover:bg-forest-700 transition"
            >
              List my rental <IconArrowRight size={15} color="#fff" />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}
