![CoSpirit](doc/logo.png)

# CoSpirit `map-component`

Fournit les outils nécessaires à l'affichage d'une carte et de données projetées sur les projets VueJs

## Development

### Project install

    git clone git@github.com:cospirit/front-component.git
    cd front-component
    make development@install

### URL

    http://map-component.cospirit.local

### Get a shell in containers

    make development@sh

## Tests

### Lints and fixes files

    make development@lint

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Install in a project

Add the dependency in `package.json` file. Be careful to choose de version corresponding to your needs.

```json
{  
  ...  
  "dependencies": {
    ...
    "map-component": "git://github.com/cospirit/map-component.git#v1.0.0"
  },  
  ...  
}  
```
Then update dependencies:

    npm install map-component
