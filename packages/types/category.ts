export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryID: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string | null;
  icon: string | null;
  subCategories: SubCategory[];
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
};
