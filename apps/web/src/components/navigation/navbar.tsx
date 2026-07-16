import { useState } from "react";
import { Search, ArrowRight, ChevronDown } from "lucide-react";
import Theme from "../theme/theme";
import Menu from "./menu";
import Container from "../layout/container";
import Logo from "../logo/logo";
import Dropdown from "../select/dropdown";
import { Button } from "../ui/button";
import Notifications from "../notification/notification";
import Input from "../input/input";
import Account from "../account/account";

const CATEGORIES = [
  { value: "tout", label: "Tout" },
  { value: "restaurants", label: "Restaurants" },
  { value: "hotels", label: "Hôtels" },
  { value: "pharmacies", label: "Pharmacies" },
  { value: "commerces", label: "Commerces" },
  { value: "tourisme", label: "Tourisme" },
  { value: "services", label: "Services" },
  { value: "entreprises", label: "Entreprises" },
];

export default function Navbar() {
  const [selectedCat, setSelectedCat] = useState(CATEGORIES[0]);
  return (
    <nav className="border-b border-neutral-100 dark:border-neutral-700/60 bg-white dark:bg-neutral-900/70 backdrop-blur-xl h-fit relative z-10">
      <Container className="max-w-6xl">
        <div className="py-2 grid grid-cols-[1fr_3fr_1.5fr] items-center gap-2">
          <Logo />
          <div className="flex gap-x-1">
            <Dropdown
              items={CATEGORIES}
              selected={selectedCat}
              setSelected={setSelectedCat}
              action={
                <Button variant="rounded">
                  <span>{selectedCat.label}</span>
                  <ChevronDown className="size-3.5" />
                </Button>
              }
            />
            <Input
              icon={Search}
              position="left"
              placeholder="Restaurants, hôtels, pharmacies…"
              value=""
              onChange={() => {}}
              clearButton={true}
            />
            <Button
              variant="rounded"
              className="group rounded-full w-10 cursor-pointer hover:border-amber-400"
            >
              <ArrowRight className="size-4 group-hover:stroke-amber-500 transition-colors" />
            </Button>
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Notifications />
            <Theme />
            <Account />
            <Menu />
          </div>
        </div>
      </Container>
    </nav>
  );
}
