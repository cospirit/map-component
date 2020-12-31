![CoSpirit](doc/logo.png)

# CoSpirit `map-component` [![CircleCI](https://circleci.com/gh/cospirit/map-component.svg?style=shield&circle-token=2b324f7bc99f0f10050972007f73463582941cde)](https://circleci.com/gh/cospirit/map-component)

This component provides everything necessary to display a map and projections on VueJs applications.

## Development

### Project install

    git clone git@github.com:cospirit/map-component.git
    cd map-component
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
