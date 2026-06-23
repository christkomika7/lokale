Je dois bloquer toutes les request relative a l ip quand j ai le rate limit active
trim les texts et tout pour eviter les injections sql et les attaques xss
si une addresse ip depasse un certains nombre faut lui bloquer
Bloquer tout les access a cet addresse ip

# Fichier init-options.d.mts dans better-auth

faire des recherches sur customSyntheticUser
. Options a faire

- add delete user
- session
- cookie

# Comment cree un plugin avec better auth

Telecharger une app pour similer plusieur ip

const deleteTrack = useApiMutation<void, string>((id) => `/api/tracks/${id}`, {
method: "delete",
invalidate: [["tracks"]],
successMessage: "Morceau supprimé.",
});

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Supprimer</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogAction onClick={() => deleteTrack.mutate(track.id)}>
      Confirmer
    </AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>
