<template>
    <csm-map
        id="demo-map"
        :data="dataLayers"
        :zoom.sync="zoom"
        :center="center"
        :control-options="options"
        :drawer-options="drawerOptions"
        @map-draw="handleMapDrawEvent"
    >
        <template v-slot:sidebar>
            <sidebar-pane title="Onglet 1" pane-id="tab1" icon="icon">
                Bonjour
            </sidebar-pane>
            <sidebar-pane title="Onglet 2" pane-id="tab2" icon="icon">
                C'est une démo
            </sidebar-pane>
        </template>
    </csm-map>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import CsmMap, {CsmDataMapLayer, CsmGeoJson, CsmMapControlOptions, CsmMarker} from "../components/map/Map.vue";
import Constants from "../utils/Constants";
import Marker from "../utils/Marker";
import GeoJson from "../utils/GeoJson";
import L, { LatLng } from "leaflet";
import SidebarPane from "../components/map/SidebarPane.vue";
import Circle from "../utils/Circle";
import _ from "lodash";
import Convertor from "../utils/Convertor";

const components = {
    CsmMap,
    SidebarPane,
};

@Component({
    components
})
export default class App extends Vue {
    protected zoom: number = 8;
    protected center: LatLng = new LatLng(45.749095, 4.82665);
    protected options: CsmMapControlOptions = {
        streetview: { active: true },
        traffic: { active: true, name: "Traffic" },
        transit: { active: true, name: "Transit" },
        bike: { active: true, name: "Bike" },
        address: { active: true, name: "Address" },
        fullscreen: {
            active: true,
            titleFalse: "fullscreen OFF",
            titleTrue: "fullscreen ON",
        },
        zoomControl: {
            active: true,
            zoomInTitle: "Zoom In",
            zoomOutTitle: "Zoom Out",
        },
    };
    protected drawerOptions: L.Control.DrawConstructorOptions = {
        draw: {
            marker: { icon: Marker.getCustomMarkerSvgCode("#00bbff", 24, 24) },
            polyline: false,
            circlemarker: false,
            polygon: {
                metric: true,
                icon: new L.DivIcon({
                    className: "leaflet-div-icon leaflet-editing-icon",
                    iconSize: new L.Point(8, 8),
                }),
            },
            rectangle: false,
            circle: {},
        }
    };
    protected dataLayers: CsmDataMapLayer[] = [
        {
            id: "layer1",
            name: "Data 1",
            objects: [
                GeoJson.createGeoJsonFeature(
                    [
                        [4, 45],
                        [4, 46],
                        [5, 45.5],
                    ],
                    null,
                    null,
                    "#33AA88"
                ),
                GeoJson.createGeoJsonFeature(
                    [[
                        [5, 47],
                        [4, 46],
                        [5, 46],
                    ], [
                        [3, 45],
                        [4, 46],
                        [4, 45.5],
                    ]],
                    null,
                    null,
                    "#993344",
                    1,
                    "MultiPolygon"
                ),
            ],
        }, {
            id: "layer2",
            name: "Data 2",
            objects: [
                {
                    type: Constants.MAP_OBJECT_TYPE.MARKER,
                    latLng: [45, 4.3],
                    icon: Marker.getCustomMarkerSvgCode("#FF0000"),
                }, {
                    type: Constants.MAP_OBJECT_TYPE.MARKER,
                    latLng: [45.1, 4.2],
                    icon: Marker.getCustomMarkerSvgCode("#0000FF"),
                }, {
                    type: Constants.MAP_OBJECT_TYPE.MARKER,
                    latLng: [44.9, 4.25],
                    icon: Marker.getCustomMarkerSvgCode("#00FF00"),
                },
            ],
        }, {
            id: "draw",
            name: "Draw",
            objects: [],
        },
    ];

    protected handleMapDrawEvent(event: L.LeafletMouseEvent) {
        console.info(event);

        const colorValue = Math.floor(Math.random() * 0xffffff).toString(16);
        const color = "#000000".slice(0, -colorValue.length) + colorValue;
        const icon: L.Icon = Marker.getCustomMarkerSvgCode(color, 24, 24);

        if ("marker" === _.get(event, "layerType", "")) {
            const lat = _.get(event, "layer", {}).getLatLng().lat;
            const lng = _.get(event, "layer", {}).getLatLng().lng;

            this.addToDrawLayer({
                type: Constants.MAP_OBJECT_TYPE.MARKER,
                latLng: [lat, lng],
                icon,
            });
        } else if ("circle" === _.get(event, "layerType", "")) {
            const polygon = Circle.generateMapCircle(
                _.invoke(_.get(event, "layer", {}), "getLatLng"),
                _.get(_.get(event, "layer", {}), "_mRadius"),
                100,
                true
            );
            this.addToDrawLayer(GeoJson.createGeoJsonFeature(
                polygon,
                null,
                null,
                color,
                1,
                "MultiPolygon"
            ));
        } else if ("polygon" === _.get(event, "layerType", "")) {
            const polygon = Convertor.latLngToPolygon(_.get(event, "layer").getLatLngs()[0]);
            this.addToDrawLayer(GeoJson.createGeoJsonFeature(
                polygon,
                null,
                null,
                color,
                1,
                "MultiPolygon"
            ));
        } else {
            const type = _.get(event, "layerType", "");
            console.warn(`DRAWER ${type} NOT IMPLEMENTED`);
        }


    }

    protected addToDrawLayer(mapObject: CsmMarker | CsmGeoJson) {
        const drawLayer = _.find(this.dataLayers, (layer) => {
            return "draw" === layer.id;
        });

        if (drawLayer) {
            drawLayer.objects.push(mapObject);
        }
    }
}
</script>
