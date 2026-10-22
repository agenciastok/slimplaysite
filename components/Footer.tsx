"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MailIcon, TelegramIcon } from "@/components/Icons";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { footerItems, siteConfig } from "@/lib/site";

export function Footer() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (pathname.startsWith("/revendedor")) return null;

  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-center md:gap-20">
        <div className="text-left">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {t.footer.linksTitle}
          </h2>
          <div className="mt-4 flex gap-10">
            {[footerItems.slice(0, 3), footerItems.slice(3)].map((column) => (
              <ul key={column[0]?.href} className="flex flex-col gap-2.5">
                {column.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "text-sm transition-colors",
                          active ? "text-white" : "text-muted hover:text-white",
                        )}
                      >
                        {t.links[item.id]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start text-left">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white">
            {t.footer.contactTitle}
          </h2>
          <a
            href={`mailto:${siteConfig.email}`}
            className="mt-4 block text-sm break-all text-soft transition-colors hover:text-white"
          >
            {siteConfig.email}
          </a>
          <div className="mt-4 flex gap-3">
            <a
              href={siteConfig.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t.a11y.telegram}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-card text-soft transition-colors hover:border-accent-bright hover:text-white"
            >
              <TelegramIcon className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label={t.a11y.email}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-card text-soft transition-colors hover:border-white hover:text-white"
            >
              <MailIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.06]">
        <p className="mx-auto max-w-6xl px-5 py-4 text-center text-sm leading-relaxed text-muted sm:px-8">
          {t.footer.legal}
        </p>
      </div>
    </footer>
  );
}
