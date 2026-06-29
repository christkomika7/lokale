import {
  ArrowUpDown,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "#/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import type { Row } from "@tanstack/react-table";
import { Plan, Role, UserStatus, type User } from "@lokale/types/user";
import { planCfg, roleCfg, statusCfg } from "#/config/admin/user";
import { sort, type SortKey } from "#/config/admin/filter";

import Container from "@/components/layout/container";
import InputIcon from "../input/input-icon";
import Dropdown from "../select/dropdown";

interface FilterProps {
  users: User[];
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  activeFilters: number;
  sortField: string;
  handleSort: (value: "name" | "actions" | "joinedAt") => void;
  rows: Row<User>[];
  openCreate: () => void;
  setStatusFilter: (value: UserStatus | "all") => void;
  setRoleFilter: (value: Role | "all") => void;
  setPlanFilter: (value: Plan | "all") => void;
  statusFilter: UserStatus | "all";
  roleFilter: Role | "all";
  planFilter: Plan | "all";
}

export default function Filter({
  users,
  globalFilter,
  setGlobalFilter,
  showFilters,
  setShowFilters,
  activeFilters,
  sortField,
  handleSort,
  rows,
  openCreate,
  setStatusFilter,
  setRoleFilter,
  setPlanFilter,
  statusFilter,
  roleFilter,
  planFilter,
}: FilterProps) {
  return (
    <div className="py-4 border-b border-input dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
      <Container>
        <div className="flex items-center gap-3">
          <InputIcon
            icon={Search}
            position="left"
            placeholder="Restaurants, hôtels, pharmacies…"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            clearButton={true}
          />
          <Button
            variant="secondary"
            className={cn("rounded-full h-10! dark:text-neutral-200!", {
              "border-amber-400 ring-3 ring-amber-500/10": activeFilters,
            })}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="size-4" />
            Filtres
            {activeFilters > 0 && (
              <span className="flex items-center justify-center h-4.5 min-w-4.5 ml-1 rounded-full bg-amber-400 text-amber-100 text-[10px] font-medium">
                {activeFilters}
              </span>
            )}
          </Button>
          <div className="flex items-center gap-x-1">
            <Dropdown
              items={Array.from(sort.entries()).map(([value, label]) => ({
                value,
                label,
              }))}
              selected={{
                value: sortField,
                label: sort.get(sortField as SortKey) || "",
              }}
              setSelected={(data) => handleSort(data.value as SortKey)}
              action={
                <Button
                  variant="secondary"
                  className="h-10! rounded-full dark:text-neutral-200!"
                >
                  <ArrowUpDown className="size-4" />
                  {sort.get(sortField as SortKey)}
                </Button>
              }
            />

            {activeFilters > 0 && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setRoleFilter("all");
                  setPlanFilter("all");
                }}
                className="ml-auto text-[11px] text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1 cursor-pointer rounded-full flex items-center gap-1"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
              {rows.length} / {users.length} utilisateurs
            </span>
            <Button
              variant="secondary"
              className="h-10! rounded-full gap-2 text-sm dark:text-neutral-200!"
            >
              <Download className="size-4" /> Exporter
            </Button>
            <Button
              variant="amber"
              className="rounded-full dark:text-amber-400!"
              onClick={openCreate}
            >
              <Plus className="size-3.5 text-white dark:text-amber-400!" />
              Ajouter
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1">
                Statut :
              </span>
              {(
                [
                  "all",
                  UserStatus.ACTIVE,
                  UserStatus.SUSPENDED,
                  UserStatus.BANNED,
                  UserStatus.PENDING,
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${statusFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all" ? "Tous" : statusCfg[v].label}
                </button>
              ))}
            </div>
            <Separator
              orientation="vertical"
              className="h-5 dark:bg-neutral-700"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1">
                Rôle :
              </span>
              {(["all", Role.ADMIN, Role.WORKSPACE, Role.USER] as const).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setRoleFilter(v)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${roleFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                  >
                    {v === "all" ? "Tous" : roleCfg[v].label}
                  </button>
                ),
              )}
            </div>
            <Separator
              orientation="vertical"
              className="h-5 dark:bg-neutral-700"
            />
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mr-1">
                Plan :
              </span>
              {(["all", Plan.FREE, Plan.PRO, Plan.BUSINESS] as const).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setPlanFilter(v)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${planFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                  >
                    {v === "all" ? "Tous" : planCfg[v].label}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
