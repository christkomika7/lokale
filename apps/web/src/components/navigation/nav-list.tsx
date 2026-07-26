import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import Container from "../layout/container";
import type { NavLink } from "@lokale/types/navigation";

interface NavListProps {
  links: NavLink[];
}

function buildBreadcrumb(pathname: string, links: NavLink[]) {
  const crumbs: { label: string; to: string }[] = [
    { label: "Admin", to: "/admin" },
  ];

  const active = links.find(({ to }) => {
    if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(to);
  });

  if (active && active.to !== "/admin") {
    crumbs.push({ label: active.label, to: active.to });
  }

  return crumbs;
}

function getBadgeClasses(variant?: "success" | "danger", isActive?: boolean) {
  switch (variant) {
    case "success":
      return isActive
        ? "bg-amber-400/10 text-amber-500 dark:text-amber-500"
        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    case "danger":
      return isActive
        ? "bg-amber-400/10 text-amber-500 dark:text-amber-500"
        : "bg-red-500/10 text-red-600 dark:text-red-400";
    default:
      return isActive
        ? "bg-amber-400/10 text-amber-500 dark:text-amber-500"
        : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-300";
  }
}

export default function NavList({ links }: NavListProps) {
  const { pathname } = useLocation();

  const crumbs = buildBreadcrumb(pathname, links);
  const activeLink = links.find(({ to }) => {
    if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
    return pathname.startsWith(to);
  });

  return (
    <>
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-20">
        <Container
          className="flex items-stretch w-full"
          aria-label="Navigation admin"
        >
          {links.map(({ to, label, icon: Icon, variant, notification }) => {
            const isActive =
              to === "/admin"
                ? pathname === "/admin" || pathname === "/admin/"
                : pathname.startsWith(to);

            const hasNotification =
              typeof notification === "number" && notification > 0;

            return (
              <Link
                key={to}
                to={to}
                className={[
                  "group relative flex flex-1 items-center justify-center gap-1.5 py-3 px-2 text-[13px] font-medium transition-colors duration-150 select-none whitespace-nowrap",
                  "border-b-2",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-inset",
                  isActive
                    ? "text-amber-400 dark:text-amber-400 border-amber-400 dark:border-amber-400"
                    : "text-neutral-500 dark:text-neutral-400 border-transparent hover:text-amber-400 dark:hover:text-amber-400",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "size-3.5 shrink-0 transition-colors duration-150",
                    isActive
                      ? "text-amber-400 dark:text-amber-400"
                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-amber-400 dark:group-hover:text-amber-400",
                  ].join(" ")}
                  aria-hidden="true"
                />
                {label}
                {hasNotification && (
                  <span
                    className={[
                      "flex items-center justify-center",
                      "size-7 px-1 rounded-full",
                      "text-[9px] font-medium leading-none tabular-nums",
                      getBadgeClasses(variant, isActive),
                    ].join(" ")}
                  >
                    {notification > 99 ? "99+" : notification}
                  </span>
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
