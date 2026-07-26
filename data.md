{/\* <div className="px-6 py-3 border-b border-input dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
<div className="flex items-center gap-3">
<div className="relative flex-1 max-w-sm">
<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
<Input
placeholder="Rechercher…"
className="pl-9 h-9 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-sm"
value={search}
onChange={(e) => setSearch(e.target.value)}
/>
{search && (
<button
onClick={() => setSearch("")}
className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" >
<X className="size-3.5" />
</button>
)}
</div>

          {tab !== "announcements" && tab !== "notifications" && (
            <Button
              variant="outline"
              size="sm"
              className={`h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 ${showFilters ? "border-amber-400 text-amber-500 ring-2 ring-amber-500/20" : "text-neutral-600 dark:text-neutral-400"}`}
              onClick={() => setFilters(!showFilters)}
            >
              <SlidersHorizontal className="size-4" /> Filtres
            </Button>
          )}

          {tab === "notifications" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  "all",
                  "security",
                  "moderation",
                  "payment",
                  "user",
                  "system",
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setNotifFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${notifFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all"
                    ? "Tous"
                    : notifTypeCfg[v as NotifType].icon && (
                        <>
                          {v === "security"
                            ? "Sécurité"
                            : v === "moderation"
                              ? "Modération"
                              : v === "payment"
                                ? "Paiement"
                                : v === "user"
                                  ? "Utilisateur"
                                  : "Système"}
                        </>
                      )}
                </button>
              ))}
            </div>
          )}

          {tab === "announcements" && (
            <div className="flex items-center gap-1.5">
              {(
                ["all", "published", "draft", "scheduled", "archived"] as const
              ).map((v) => (
                <button
                  key={v}
                  // onClick={() => setAnnouncementFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700`}

                  // className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${announcementFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all" ? "Tous" : announcementStatusCfg[v].label}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
              {currentCount} éléments
            </span>
            {tab === "notifications" && 2 > 0 && (
              // {tab === "notifications" && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                // onClick={markAllRead}`
              >
                <CheckCircle2 className="size-3.5" /> Tout lire
              </Button>
            )}
            {tab === "announcements" && (
              <Button
                variant="amber"
                size="sm"
                className="h-9 gap-2 rounded-xl text-sm"
                onClick={() => setShowForm(true)}
              >
                <Plus className="size-4" /> Nouvelle annonce
              </Button>
            )}
            {tab !== "announcements" && tab !== "notifications" && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
              >
                <Download className="size-4" /> Exporter
              </Button>
            )}
          </div>
        </div>

        {showFilters && tab === "reports" && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-400">Statut :</span>
            {(["all", "pending", "resolved", "ignored"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setStatus(v)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
              >
                {v === "all" ? "Tous" : reportStatusCfg[v].label}
              </button>
            ))}
          </div>
        )}
        {showFilters && tab === "logs" && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Niveau :</span>
              {(["all", "info", "warning", "error", "critical"] as const).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setLevel(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${levelFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                  >
                    {v === "all" ? "Tous" : logLevelCfg[v].label}
                  </button>
                ),
              )}
            </div>
            <Separator
              orientation="vertical"
              className="h-5 dark:bg-neutral-700"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Catégorie :</span>
              {(
                [
                  "all",
                  "auth",
                  "admin",
                  "permission",
                  "deletion",
                  "server",
                  "modification",
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setCat(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${catFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all" ? "Tous" : logCategoryCfg[v].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div> */}
