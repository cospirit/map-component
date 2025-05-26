# Intégration de leaflet.markercluster dans Map.vue

## Étapes principales

1. **Installer la dépendance**
   ```sh
   npm install leaflet.markercluster
   ```
2. **Importer les fichiers nécessaires**
   Dans le `<script>` de Map.vue :
   ```js
   import 'leaflet.markercluster';
   import 'leaflet.markercluster/dist/MarkerCluster.css';
   import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
   ```
3. **Créer et gérer les groupes de clusters**
   - Ajouter une propriété `markerClusterGroups` dans la classe Map pour stocker les groupes de clusters par couche.
   - Dans `mounted` et lors des changements de `data`, créer/mettre à jour les groupes de clusters.
   - Ajouter les marqueurs dans le cluster group au lieu de les afficher individuellement.
   - Ajouter le cluster group à la carte et au layer control.

## Exemple de logique à ajouter dans Map.vue

- Ajouter dans la classe :
  ```ts
  protected markerClusterGroups: { [key: string]: L.MarkerClusterGroup } = {};
  ```
- Dans `mounted` et dans un watcher sur `data` :
  - Pour chaque `dataLayer`, créer un `L.MarkerClusterGroup` si besoin.
  - Ajouter les marqueurs à ce groupe.
  - Ajouter le groupe à la carte et au layer control.
- Nettoyer les anciens groupes lors des changements de données.

## Modifications du template

- Retirer l'affichage direct des `<l-marker>` dans le template.
- Gérer l'ajout des marqueurs dans le cluster group côté script.

---

Je vais maintenant modifier Map.vue pour intégrer cette logique.
