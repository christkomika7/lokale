import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import CategoryManager from "./category/category-manager";
import SubCategoryManager from "./category/sub-category/sub-category-manager";

export default function Categories() {
  return (
    <Tabs defaultValue="categories" className="space-y-3">
      <TabsList>
        <TabsTrigger value="categories">Catégories</TabsTrigger>
        <TabsTrigger value="sub-categories">Sous-catégories</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="space-y-3">
        <CategoryManager />
      </TabsContent>

      <TabsContent value="sub-categories" className="space-y-3">
        <SubCategoryManager />
      </TabsContent>
    </Tabs>
  );
}
