import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "../ui/button";
import Dropdown from "../select/dropdown";

const ITEMS = [
  { label: "Hôtels", value: "hotels" },
  { label: "Restaurants", value: "restaurants" },
  { label: "Pharmacies", value: "pharmacies" },
];

export default function Menu() {
  const [selected, setSelected] = useState(ITEMS[0]);
  return (
    <Dropdown
      items={ITEMS}
      selected={selected}
      setSelected={setSelected}
      action={
        <Button variant="icon" size="icon" className="w-10 rounded-full">
          <MenuIcon className="size-3.5 group-hover:text-amber-400 dark:text-neutral-200 dark:group-hover:text-amber-400 transition-colors" />
        </Button>
      }
    />
  );
}
