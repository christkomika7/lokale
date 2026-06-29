import { createFileRoute } from "@tanstack/react-router";
import { Plan, Role, UserStatus, type User } from "@lokale/types/user";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { usePaginatedQuery } from "#/hook/use-paginated-query";
import { formatDate, formatRelativeDate } from "@lokale/lib/date";

import UsersTable from "#/components/table/admin/user";
import Filter from "#/components/dashboard/filter";
import { useDebouncedValue } from "#/hook/use-debounced-value";
import PanelContainer from "#/components/sheet/panel-container";
import UserDetail from "#/components/dashboard/user/user-detail";
import UserForm from "#/components/dashboard/user/user-form";

export const Route = createFileRoute("/(private)/admin/users")({
  component: RouteComponent,
});

type PanelMode = "detail" | "create" | "edit";

const SORT_FIELD_MAP: Record<string, "name" | "joinedAt" | "activity"> = {
  name: "name",
  joinedAt: "joinedAt",
  lastSeen: "activity",
};

const columnHelper = createColumnHelper<User>();

function RouteComponent() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 400);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "joinedAt", desc: true },
  ]);
  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);

  const activeSort = sorting[0];
  const sortBy = activeSort ? SORT_FIELD_MAP[activeSort.id] : undefined;
  const sortOrder = activeSort?.desc ? "desc" : "asc";

  const { items: users, isLoading } = usePaginatedQuery<User>(
    ["admin-user"],
    "/admin/users",
    {
      pageSize: 20,
      params: {
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        plan: planFilter !== "all" ? planFilter : undefined,
        sortBy,
        sortOrder,
      },
    },
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Utilisateur",
        enableSorting: true,
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Contact",
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Statut",
        enableSorting: false,
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: "Rôle",
        enableSorting: false,
      }),
      columnHelper.accessor("plan", {
        id: "plan",
        header: "Plan",
        enableSorting: false,
      }),
      columnHelper.accessor("actions", {
        id: "actions",
        header: "Actions",
        enableSorting: false,
      }),
      columnHelper.accessor("joinedAt", {
        id: "joinedAt",
        header: "Inscription",
        enableSorting: true,
        cell: (info) => formatDate(info.getValue()),
      }),
      columnHelper.accessor("lastSeen", {
        id: "lastSeen",
        header: "Dernière activité",
        enableSorting: true,
        cell: (info) => formatRelativeDate(info.getValue()),
      }),
      columnHelper.accessor("city", {
        id: "city",
        header: "Ville",
        enableSorting: false,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  const activeFilters = [statusFilter, roleFilter, planFilter].filter(
    (f) => f !== "all",
  ).length;

  function handleSort(field: "name" | "actions" | "joinedAt" | "lastSeen") {
    const current = sorting[0];
    if (current?.id === field) {
      setSorting([{ id: field, desc: !current.desc }]);
    } else {
      setSorting([{ id: field, desc: field !== "name" }]);
    }
  }

  function openDetail(user: User) {
    setSelectedUser(user);
    setPanelMode("detail");
    setOpen(true);
  }

  function openCreate() {
    setSelectedUser(null);
    setPanelMode("create");
    setOpen(true);
  }

  function closePanel() {
    setSelectedUser(null);
    setOpen(false);
  }

  const sortField = sorting[0]?.id ?? "joinedAt";

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Filter
          globalFilter={search}
          setGlobalFilter={setSearch}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilters={activeFilters}
          sortField={sortField}
          handleSort={handleSort}
          rows={rows}
          users={users}
          openCreate={openCreate}
          setStatusFilter={setStatusFilter}
          setRoleFilter={setRoleFilter}
          setPlanFilter={setPlanFilter}
          statusFilter={statusFilter}
          roleFilter={roleFilter}
          planFilter={planFilter}
        />
        <UsersTable
          rows={rows}
          isLoading={isLoading}
          selectedUser={selectedUser}
          openDetail={openDetail}
          closePanel={closePanel}
          panelMode={panelMode}
        />
      </div>

      <PanelContainer<User>
        open={open}
        mode={panelMode}
        data={selectedUser}
        onClose={closePanel}
        onModeChange={setPanelMode}
        detail={(user, { toEdit, close }) => (
          <UserDetail user={user} onEdit={toEdit} onClose={close} />
        )}
        edit={(user, { toDetail }) => (
          <UserForm mode="edit" user={user} onClose={toDetail} />
        )}
        create={({ close }) => <UserForm mode="create" onClose={close} />}
      />
    </div>
  );
}
