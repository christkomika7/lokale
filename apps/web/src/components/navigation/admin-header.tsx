import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import Container from "../layout/container";
import { adminNavLinks } from "@/config/navigation";

function buildBreadcrumb(pathname: string) {
  const crumbs: { label: string; to: string }[] = [
    { label: "Admin", to: "/admin" },
  ];

  const active = adminNavLinks.find(({ to }) => {
    if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(to);
  });

  if (active && active.to !== "/admin") {
    crumbs.push({ label: active.label, to: active.to });
  }

  return crumbs;
}

export default function AdminHeader() {
  const { pathname } = useLocation();

  const crumbs = buildBreadcrumb(pathname);
  const activeLink = adminNavLinks.find(({ to }) => {
    if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(to);
  });

  return (
    <>
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-20">
        <Container
          className="grid grid-cols-8 items-end gap-0"
          aria-label="Navigation admin"
        >
          {adminNavLinks.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === "/admin"
                ? pathname === "/admin" || pathname === "/admin/"
                : pathname.startsWith(to);

            return (
              <Link
                key={to}
                to={to}
                className={[
                  "group relative flex items-center gap-1.5 py-3 text-[13px] font-medium transition-colors duration-150 select-none whitespace-nowrap",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-t-md",
                  isActive
                    ? "text-amber-400 dark:text-amber-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-3.5 shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-amber-400 dark:text-amber-400"
                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-100",
                  ].join(" ")}
                  aria-hidden="true"
                />
                {label}
                {isActive && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-amber-400 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </Container>
      </header>
      <div className="py-2">
        <Container>
          <div
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1.5 mb-3"
          >
            {crumbs.map((crumb, i) => (
              <span key={crumb.to} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight
                    className="size-3 text-neutral-300 dark:text-neutral-700"
                    aria-hidden="true"
                  />
                )}
                {i === crumbs.length - 1 ? (
                  <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {activeLink && (
              <span className="flex items-center justify-center size-8 rounded-sm bg-amber-400/10 dark:bg-amber-400/10 text-amber-400 shrink-0">
                <activeLink.icon className="size-4" aria-hidden="true" />
              </span>
            )}
            <h1 className="text-xl font-semibold tracking-tight text-neutral-800 dark:text-neutral-100 leading-none">
              {activeLink?.label ?? "Admin"}
            </h1>
          </div>
        </Container>
      </div>
    </>
  );
}
