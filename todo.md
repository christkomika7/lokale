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

# Cas aucun user

- si aucun user donnecter automatiquement, toujours verifier si le user existe son role et les permissions
- lors de la creation du compte dans le mail otp y a pas le nom du user (inconnu)
- Quand je cree un compte il est fait avec le role workspace au lieu de user
- Quand je cree un user avec le role workspace il a le forfait pro pendant un mois gratuitement
- revoir les messages du au status code au niveau du rate de auth-error.ts
- revoir la deconnexion des fois une fois deconnecter le btn connexion ne me renvoi pas vers signin
- Voir to les mailto present dans les liens de mon projet
