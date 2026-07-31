export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string | null;
  icon: string | null;
  subCategories: SubCategory[];
  _count?: { subCategories: number };
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryID: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export type CategorySchemaType = {
  name: string;
  slug: string;
  description: string;
  color?: string;
  icon?: string;
};

export type SubCategorySchemaType = {
  name: string;
  slug: string;
  description: string;
  categoryID: string;
};
