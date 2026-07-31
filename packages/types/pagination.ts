export type FindManyArgs<D> = D extends { findMany: (args?: infer A) => any }
  ? A
  : never;
export type WhereOf<D> =
  FindManyArgs<D> extends { where?: infer W }
    ? NonNullable<W>
    : Record<string, unknown>;
export type OrderByOf<D> =
  FindManyArgs<D> extends { orderBy?: infer O } ? O : never;
export type IncludeOf<D> =
  FindManyArgs<D> extends { include?: infer I } ? I : never;
export type SelectOf<D> =
  FindManyArgs<D> extends { select?: infer S } ? S : never;

export type FindManyResult<D> = D extends {
  findMany: (args?: any) => Promise<infer R>;
}
  ? R
  : never;
export type ItemOf<D> = FindManyResult<D> extends (infer I)[] ? I : never;

export interface PaginateMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginateMeta;
}

export interface PaginateOptions<D> {
  page?: number;
  perPage?: number;
  maxPerPage?: number;
  where?: WhereOf<D>;
  orderBy?: OrderByOf<D>;
  include?: IncludeOf<D>;
  select?: SelectOf<D>;
  search?: string;
  searchFields?: (keyof WhereOf<D>)[];
}

export interface PaginateMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginateMeta;
}

export type Delegate = {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
};
