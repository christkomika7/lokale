import { LogIn } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { initials } from "#/lib/utils";
import { authClient } from "#/lib/auth-client";
import { queryClient } from "#/lib/query-client";
import type { ItemSelectProps } from "../select/lib/type";

import Dropdown from "../select/dropdown";

export default function Account() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const ITEMS: ItemSelectProps[] = [
    {
      label: "Mon compte",
      items: [
        { label: "Profil", value: "profile", isActive: false },
        { label: "Paramètres", value: "settings", isActive: false },
        { label: "Abonnements", value: "subscriptions", isActive: true },
        { label: "Annonces", value: "listings", isActive: false },
        { label: "Favoris", value: "favorites", isActive: false },
        { label: "messagerie", value: "messages", isActive: false },
        { label: "Aide", value: "help" },
      ],
    },
    {
      label: "Authentification",
      items: [
        {
          label: "Deconnexion",
          value: "disconnect",
          async action() {
            await authClient.signOut();
            await queryClient.invalidateQueries({
              queryKey: ["session"],
            });
            await router.invalidate({ sync: true });
            router.navigate({
              to: "/sign-in",
              replace: true,
            });
          },
        },
      ],
    },
  ];

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Link to="/sign-in">
        <Button variant="amber" className="rounded-md dark:text-amber-400!">
          <LogIn className="size-3.5 text-white dark:text-amber-400!" />
          Connexion
        </Button>
      </Link>
    );
  }

  return (
    <Dropdown
      groups={ITEMS}
      selected={ITEMS[0].items[0]}
      setSelected={() => {}}
      header={{
        name: `${session.user.lastname} ${session.user.firstname}`,
        email: session.user.email,
      }}
      action={
        <Button variant="icon" size="icon" className="w-10 rounded-full">
          <Avatar className="size-10">
            {session.user.image && <AvatarImage src={session.user.image} />}
            <AvatarFallback className="bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 font-bold text-sm">
              {initials(`${session.user.lastname} ${session.user.firstname}`)}
            </AvatarFallback>
          </Avatar>
        </Button>
      }
    />
  );
}
