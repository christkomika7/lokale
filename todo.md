Je dois bloquer toutes les request relative a l ip quand j ai le rate limit active
trim les texts et tout pour eviter les injections sql et les attaques xss
si une addresse ip depasse un certains nombre faut lui bloquer
Bloquer tout les access a cet addresse ip

# Cas aucun user

- si aucun user donnecter automatiquement, toujours verifier si le user existe son role et les permissions
- Quand je cree un compte il est fait avec le role workspace au lieu de user
- revoir les messages du au status code au niveau du rate de auth-error.ts
- Voir to les mailto present dans les liens de mon projet
