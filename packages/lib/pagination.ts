import type {
  Delegate,
  ItemOf,
  PaginateOptions,
  PaginatedResult,
  WhereOf,
} from "../types/pagination";

/**
 * Pagination + filtre + tri génériques pour n'importe quel modèle Prisma.
 *
 * Usage :
 *   paginate(prisma.country, {
 *     page: 1,
 *     perPage: 20,
 *     search: "congo",
 *     searchFields: ["name", "code"],
 *     where: { continent: "Afrique" },
 *     orderBy: { name: "asc" },
 *     include: { currency: true },
 *   })
 *
 * Le typage de `where`/`orderBy`/`include`/`select` est déduit automatiquement
 * du délégué Prisma passé en premier argument (ex: prisma.country donne
 * Prisma.CountryWhereInput, Prisma.CountryOrderByWithRelationInput, etc.).
 *
 * NB : le type des `items` retournés reflète le type de base du modèle
 * (sans les relations d'`include`). Si tu utilises `include`, précise le
 * type exact en 2e paramètre générique :
 *   paginate<typeof prisma.country, CountryWithRelations>(prisma.country, {...})
 */
export async function paginate<D extends Delegate, TResult = ItemOf<D>>(
  delegate: D,
  options: PaginateOptions<D> = {},
): Promise<PaginatedResult<TResult>> {
  const {
    page = 1,
    perPage = 20,
    maxPerPage = 100,
    where,
    orderBy,
    include,
    select,
    search,
    searchFields,
  } = options;

  const safePage = Math.max(1, Math.floor(page));
  const safePerPage = Math.min(Math.max(1, Math.floor(perPage)), maxPerPage);

  const searchClause =
    search && searchFields?.length
      ? {
          OR: searchFields.map((field) => ({
            [field]: { contains: search, mode: "insensitive" as const },
          })),
        }
      : {};

  const finalWhere = {
    ...(where ?? {}),
    ...searchClause,
  } as WhereOf<D>;

  const [items, total] = await Promise.all([
    delegate.findMany({
      where: finalWhere,
      ...(orderBy ? { orderBy } : {}),
      ...(include ? { include } : {}),
      ...(select ? { select } : {}),
      skip: (safePage - 1) * safePerPage,
      take: safePerPage,
    }),
    delegate.count({ where: finalWhere }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safePerPage));

  return {
    items: items as TResult[],
    meta: {
      page: safePage,
      perPage: safePerPage,
      total,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
  };
}
