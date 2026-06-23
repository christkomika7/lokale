import { createFileRoute } from "@tanstack/react-router";
import UserSheet from "#/components/dashboard/user/sheet/user-sheet";
import UsersTable from "#/components/table/admin/user";
import Filter from "#/components/dashboard/filter";
import {
  Plan,
  Role,
  UserStatus,
  type AdminUsers,
  type UserFormData,
} from "#/types/user";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(private)/admin/users")({
  component: RouteComponent,
});

type PanelMode = "detail" | "create" | "edit";

const INITIAL_USERS: AdminUsers[] = [
  {
    id: "u1",
    name: "Princesse Moukala",
    email: "p.moukala@gmail.com",
    phone: "+242 06 123 4567",
    avatar: "",
    role: Role.USER,
    status: UserStatus.ACTIVE,
    plan: Plan.PRO,
    country: "Congo",
    city: "Brazzaville",
    joinedAt: "2024-01-15",
    lastSeen: "Il y a 3 min",
    actions: 142,
    emailVerified: true,
    idVerified: true,
    ips: ["197.243.12.4", "197.243.18.9"],
    devices: ["iPhone 14", "Chrome / macOS"],
    suspiciousActivity: false,
  },
  {
    id: "u2",
    name: "Jean-Baptiste Nkounkou",
    email: "jb.nkounkou@outlook.com",
    phone: "+242 05 987 6543",
    avatar: "",
    role: Role.WORKSPACE,
    status: UserStatus.ACTIVE,
    plan: Plan.BUSINESS,
    country: "Congo",
    city: "Pointe-Noire",
    joinedAt: "2023-11-03",
    lastSeen: "Il y a 1h",
    actions: 389,
    emailVerified: true,
    idVerified: true,
    ips: ["41.202.219.14"],
    devices: ["Samsung S23", "Firefox / Windows"],
    suspiciousActivity: false,
  },
  {
    id: "u3",
    name: "Arlette Massamba",
    email: "a.massamba@yahoo.fr",
    phone: "+242 06 456 7890",
    avatar: "",
    role: Role.USER,
    status: UserStatus.SUSPENDED,
    plan: Plan.FREE,
    country: "Congo",
    city: "Dolisie",
    joinedAt: "2024-03-22",
    lastSeen: "Il y a 2j",
    actions: 28,
    emailVerified: true,
    idVerified: false,
    ips: ["41.202.200.1"],
    devices: ["Chrome / Android"],
    suspiciousActivity: true,
  },
  {
    id: "u4",
    name: "Rodrigue Bokamba",
    email: "r.bokamba@gmail.com",
    phone: "+242 05 321 0987",
    avatar: "",
    role: Role.USER,
    status: UserStatus.ACTIVE,
    plan: Plan.PRO,
    country: "Congo",
    city: "Brazzaville",
    joinedAt: "2023-08-10",
    lastSeen: "Il y a 20 min",
    actions: 891,
    emailVerified: true,
    idVerified: true,
    ips: ["197.243.45.2", "197.243.12.4"],
    devices: ["MacBook Pro", "iPhone 13"],
    suspiciousActivity: false,
  },
  {
    id: "u5",
    name: "Christelle Loemba",
    email: "c.loemba@gmail.com",
    phone: "+242 06 654 3210",
    avatar: "",
    role: Role.USER,
    status: UserStatus.BANNED,
    plan: Plan.FREE,
    country: "Congo",
    city: "Pointe-Noire",
    joinedAt: "2024-05-08",
    lastSeen: "Il y a 14j",
    actions: 7,
    emailVerified: false,
    idVerified: false,
    ips: ["102.244.51.8"],
    devices: ["Chrome / Windows"],
    suspiciousActivity: true,
  },
  {
    id: "u6",
    name: "Serge Itoua",
    email: "s.itoua@hotmail.com",
    phone: "+242 05 111 2233",
    avatar: "",
    role: Role.WORKSPACE,
    status: UserStatus.ACTIVE,
    plan: Plan.BUSINESS,
    country: "Congo",
    city: "Brazzaville",
    joinedAt: "2023-06-01",
    lastSeen: "Il y a 5 min",
    actions: 1204,
    emailVerified: true,
    idVerified: true,
    ips: ["197.243.12.7"],
    devices: ["iPad Pro", "Chrome / Windows"],
    suspiciousActivity: false,
  },
  {
    id: "u7",
    name: "Mireille Nganga",
    email: "m.nganga@gmail.com",
    phone: "+242 06 778 9900",
    avatar: "",
    role: Role.USER,
    status: UserStatus.PENDING,
    plan: Plan.FREE,
    country: "Congo",
    city: "Nkayi",
    joinedAt: "2025-01-02",
    lastSeen: "Il y a 3j",
    actions: 2,
    emailVerified: false,
    idVerified: false,
    ips: ["41.202.210.5"],
    devices: ["Safari / iPhone"],
    suspiciousActivity: false,
  },
  {
    id: "u8",
    name: "Patrick Elenga",
    email: "p.elenga@gmail.com",
    phone: "+242 05 445 6677",
    avatar: "",
    role: Role.USER,
    status: UserStatus.ACTIVE,
    plan: Plan.PRO,
    country: "Congo",
    city: "Pointe-Noire",
    joinedAt: "2023-12-14",
    lastSeen: "Il y a 45 min",
    actions: 267,
    emailVerified: true,
    idVerified: true,
    ips: ["41.202.219.88"],
    devices: ["Chrome / Linux"],
    suspiciousActivity: false,
  },
];

const columnHelper = createColumnHelper<AdminUsers>();

function RouteComponent() {
  const [users, setUsers] = useState<AdminUsers[]>(INITIAL_USERS);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "joinedAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [planFilter, setPlanFilter] = useState<Plan | "all">("all");

  const [selectedUser, setSelectedUser] = useState<AdminUsers | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("detail");
  const [open, setOpen] = useState(false);

  const effectiveColumnFilters = useMemo(() => {
    const filters: ColumnFiltersState = [];
    if (statusFilter !== "all")
      filters.push({ id: "status", value: statusFilter });
    if (roleFilter !== "all") filters.push({ id: "role", value: roleFilter });
    if (planFilter !== "all") filters.push({ id: "plan", value: planFilter });
    return filters;
  }, [statusFilter, roleFilter, planFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Utilisateur",
        enableSorting: true,
        filterFn: "includesString",
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "Contact",
        enableSorting: false,
      }),
      columnHelper.accessor("status", {
        id: "status",
        header: "Statut",
        enableSorting: true,
        filterFn: (row, id, value) => row.getValue(id) === value,
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: "Rôle",
        enableSorting: true,
        filterFn: (row, id, value) => row.getValue(id) === value,
      }),
      columnHelper.accessor("plan", {
        id: "plan",
        header: "Plan",
        enableSorting: true,
        filterFn: (row, id, value) => row.getValue(id) === value,
      }),
      columnHelper.accessor("actions", {
        id: "actions",
        header: "Actions",
        enableSorting: true,
      }),
      columnHelper.accessor("joinedAt", {
        id: "joinedAt",
        header: "Inscription",
        enableSorting: true,
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
    state: {
      sorting,
      columnFilters: effectiveColumnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _colId, filterValue) => {
      const q = String(filterValue).toLowerCase();
      return (
        row.original.name.toLowerCase().includes(q) ||
        row.original.email.toLowerCase().includes(q) ||
        row.original.city.toLowerCase().includes(q)
      );
    },
  });

  const rows = table.getRowModel().rows;
  const activeFilters = [statusFilter, roleFilter, planFilter].filter(
    (f) => f !== "all",
  ).length;

  function handleSort(field: "name" | "actions" | "joinedAt") {
    const current = sorting[0];
    if (current?.id === field) {
      setSorting([{ id: field, desc: !current.desc }]);
    } else {
      setSorting([{ id: field, desc: field !== "name" }]);
    }
  }

  function openDetail(user: AdminUsers) {
    setSelectedUser(user);
    setPanelMode("detail");
    setOpen(true);
  }

  function openCreate() {
    setSelectedUser(null);
    setPanelMode("create");
    setOpen(true);
  }

  function openEdit() {
    setPanelMode("edit");
    setOpen(true);
  }

  function closePanel() {
    setSelectedUser(null);
    setOpen(false);
  }

  function handleSave(data: UserFormData) {
    if (panelMode === "create") {
      const newUser: AdminUsers = {
        id: `u${Date.now()}`,
        ...data,
        avatar: "",
        joinedAt: new Date().toISOString().split("T")[0],
        lastSeen: "À l'instant",
        actions: 0,
        ips: [],
        devices: [],
        suspiciousActivity: false,
      };
      setUsers((prev) => [newUser, ...prev]);
      closePanel();
    } else if (panelMode === "edit" && selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...data } : u)),
      );
      setSelectedUser((prev: any) => (prev ? { ...prev, ...data } : null));
      setPanelMode("detail");
    }
  }

  const sortField = sorting[0]?.id ?? "joinedAt";

  return (
    <div className="flex h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Filter
          users={users}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFilters={activeFilters}
          sortField={sortField}
          handleSort={handleSort}
          rows={rows}
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
          selectedUser={selectedUser}
          openDetail={openDetail}
          closePanel={closePanel}
          panelMode={panelMode}
        />
      </div>
      <UserSheet
        open={open}
        panelMode={panelMode}
        selectedUser={selectedUser}
        openEdit={openEdit}
        closePanel={closePanel}
        handleSave={handleSave}
        setPanelMode={setPanelMode}
      />
    </div>
  );
}
