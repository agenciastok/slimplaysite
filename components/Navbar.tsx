"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { CloseIcon, MenuIcon } from "@/components/Icons";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { navItems } from "@/lib/site";

function isCurrent(pathname: string, id: string, href: string) {
  if (pathname === href) return true;
  if (id !== "upload") return false;
  return pathname === "/login" || pathname === "/gerenciar" || pathname === "/manage" || pathname === "/upload-de-lista";
}

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1280px)").matches) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (pathname.startsWith("/revendedor")) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.08] bg-bg/85 backdrop-blur-xl">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-bg"
      >
        {t.a11y.skip}
      </a>
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-center gap-2 px-4 sm:gap-3 sm:px-8">
        <Link href="/" className="rounded-lg">
          <Logo />
        </Link>
        <nav aria-label={t.a11y.mainNav} className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => {
                const active = isCurrent(pathname, item.id, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-2.5 py-2 text-sm whitespace-nowrap transition-colors",
                  active ? "text-white" : "text-muted hover:text-white",
                )}
              >
                {t.links[item.id]}
                {active ? (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-accent-bright" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="hidden xl:block">
          <LanguageSelector />
        </div>
        <ButtonLink href="/ativacao" size="sm" showFrom="xl">
          {t.navCta}
        </ButtonLink>
        <div className="xl:hidden">
          <LanguageSelector />
        </div>
        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-white/15 text-white xl:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? t.a11y.closeMenu : t.a11y.openMenu}</span>
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-menu"
          aria-label={t.a11y.mainNav}
          className="max-h-[calc(100vh-4.5rem)] overflow-auto border-t border-white/10 bg-bg/95 px-5 py-4 backdrop-blur-xl xl:hidden"
        >
          <ul className="flex flex-col items-center gap-1">
            {navItems.map((item) => {
                const active = isCurrent(pathname, item.id, item.href);
              return (
                <li key={item.href} className="w-full max-w-sm">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-center text-base",
                      active
                        ? "border border-accent-bright/70 bg-white/[0.04] text-white"
                        : "text-soft hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    {t.links[item.id]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink href="/ativacao" className="mx-auto mt-4 w-full max-w-sm">
            {t.navCta}
          </ButtonLink>
        </nav>
      ) : null}
    </header>
  );
}
