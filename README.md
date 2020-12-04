![CoSpirit](doc/logo.png)

# Composant Map #

Fournit les outils nécessaires à l'affichage d'une carte et de données projetées sur les projets VueJs

### Demo ###

Monter le container docker :

`docker-compose up -d`

Se connecter sur le container :

```docker container exec -e COLUMNS=`tput cols` -e LINES=`tput lines` -i -t map-component /bin/bash```

Installer les dépendances :

`npm install`

Lancer le serveur :

`npm run serve`

Se rendre sur la page web : `http://map.localhost`

Pour démonter le container :

`docker-compose stop`

### Installation dans un projet ###

Ajouter la dépendance dans votre package.json en prenant soin de bien choisir la version :

```
{  
  ...  
  "dependencies": {
    ...
    "cospirit-map-component": "git+ssh://git@bitbucket.org/cospirit/cospirit-map-component.git#v1.0.0"
  },  
  ...  
}  
```

Mettre à jour les dépendances :

`npm install cospirit-map-component`

### Utilisation ###

Voir code démo
