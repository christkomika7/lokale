import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "../ui/button";

export default function Theme() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="icon"
      size="icon"
      className="w-10 rounded-full"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-3.5 group-hover:text-amber-400 transition-colors dark:text-neutral-200 dark:group-hover:text-amber-400" />
      ) : (
        <Moon className="size-3.5 group-hover:text-amber-400 transition-colors dark:text-neutral-200 dark:group-hover:text-amber-400" />
      )}
    </Button>
  );
}
