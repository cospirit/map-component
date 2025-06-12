<template>
    <div :id="id" class="csm-map">
        <div v-for="dataLayer in data" :key="dataLayer.id">
            <div v-for="(object, index) in dataLayer.objects" :key="index">
                <div v-if="object.options.style.fillColor !== ''">
                    <hatch-pattern :color="object.options.style.color"></hatch-pattern>
                </div>
            </div>
        </div>
        <l-map
            ref="myMap"
            :zoom="zoom"
            :max-zoom="maxZoom"
            :center="center"
            :bounds="bounds"
            :options="mapOptions"
            @click="mapClick"
            @click.right="mapRightClick"
            @draw:created="handleDraw"
            @update:center="$emit('update:center', $event)"
            @update:zoom="$emit('update:zoom', $event)"
            @update:bounds="$emit('update:bounds', $event)"
        >
            <l-control-layers ref="layersControl" position="topright" />
            <l-tile-layer
                v-for="layer in tileLayers"
                :key="layer.name"
                :name="layer.name"
                :visible="layer.visible"
                :url="layer.url"
                :options="tileLayerOptions"
                layer-type="base"
            />
            <l-control-zoom
                v-if="fullControlOptions.zoomControl.active"
                :zoom-in-title="fullControlOptions.zoomControl.zoomInTitle"
                :zoom-out-title="fullControlOptions.zoomControl.zoomOutTitle"
                position="bottomright"
            />
            <l-layer-group v-for="dataLayer in data" ref="overlayLayers" :key="dataLayer.id" :name="dataLayer.name">
                <template v-for="(object , index) in dataLayer.objects">
                    <template v-if="isMarker(object)">
                        <l-marker
                            :lat-lng="object.latLng"
                            :icon="object.icon ? object.icon : dataLayer.icon"
                            :key="index"
                            @click="objectClick(object, $event.latlng, dataLayer.id)"
                            @click.right="objectRightClick(object, $event.latlng, dataLayer.id)"
                        />
                    </template>
                    <template v-else-if="isGeoJson(object)">
                        <l-geo-json
                            :geojson="object.geoJson"
                            :options="object.options"
                            :key="index"
                            @click="objectClick(object, $event.latlng, dataLayer.id)"
                            @click.right="objectRightClick(object, $event.latlng, dataLayer.id)"
                        />
                    </template>
                </template>
            </l-layer-group>
            <l-layer-group ref="popupLayer">
                <l-popup :options="popupOptions">
                    <div>
                        <template v-if="popupData">
                            <slot :popupData="popupData" name="popup" />
                        </template>
                    </div>
                </l-popup>
            </l-layer-group>
        </l-map>
        <sidebar
            v-if="map && hasSidebar"
            :id="siderbarId"
            :active-pane="activeSidebarPane"
            @mounted="addSidebarToMap"
            @change="handleSidebarTabChange"
        >
            <slot name="sidebar" />
        </sidebar>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import L, { GeoJSONOptions, Path } from "leaflet";
import { LMap, LTileLayer, LControlLayers, LMarker, LControlZoom, LLayerGroup, LGeoJson, LPopup } from "vue2-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet.gridlayer.googlemutant";
import "leaflet-pegman/leaflet-pegman.min.css";
import "leaflet-pegman/leaflet-pegman.min";
import "leaflet-sidebar-v2";
import "leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-sidebar-v2/css/leaflet-sidebar.css";
import "leaflet-geosearch/assets/css/leaflet.css";
import "geoportal-extensions-leaflet";
import "geoportal-extensions-leaflet/dist/GpPluginLeaflet.css";
import GeoJson from "geojson";
import _ from "lodash";
import {Prop, Watch} from "vue-property-decorator";
import Sidebar from "./Sidebar.vue";
import Constants from "../../utils/Constants";
import "../../assets/css/map.scss";
import Marker from "../../utils/Marker";
import hatchPattern from "./HatchPattern.vue";

interface Size {
    height: number;
    width: number;
}

interface CsmTileLayer {
    name: string;
    visible: boolean;
    url: string;
}

export interface CsmDataMapLayer {
    id: string;
    name: string;
    icon?: L.Icon;
    objects: Array<CsmMarker|CsmGeoJson>;
    inLayerControl?: boolean;
}

interface CsmOverlayLayers {
    [key: string]: L.Layer;
}

interface CsmMapObject {
    type: string;
    popupData?: CsmPopupData | null;
}

export interface CsmMarker extends CsmMapObject {
    latLng: [number, number];
    icon?: L.Icon | L.DivIcon;
}

export interface CsmGeoJson extends CsmMapObject {
    options: GeoJSONOptions | null;
    geoJson: GeoJson.GeoJsonObject;
}

export interface CsmPopupData {
    type: string;
    data: {
        [key: string]: any;
    };
}

export interface CsmMapObjectEvent {
    representation: CsmMarker | CsmGeoJson;
    latLng: [number, number];
    dataLayerId: string;
}

export interface CsmMapControlOptions {
    traffic?: {
        active: boolean;
        name: string;
    };
    transit?: {
        active: boolean;
        name: string;
    };
    bike?: {
        active: boolean;
        name: string;
    };
    address?: {
        active: boolean;
        name: string;
    };
    iris?: {
        active: boolean;
        name: string;
    };
    fullscreen?: {
        active: boolean;
        titleFalse?: string;
        titleTrue?: string;
    };
    streetview?: {
        active: boolean;
    };
    zoomControl?: {
        active: boolean;
        zoomInTitle?: string;
        zoomOutTitle?: string;
    };
}

interface CsmMapControlFullOptions extends CsmMapControlOptions {
    traffic: {
        active: boolean;
        name: string;
    };
    transit: {
        active: boolean;
        name: string;
    };
    bike: {
        active: boolean;
        name: string;
    };
    address: {
        active: boolean;
        name: string;
    };
    iris: {
        active: boolean;
        name: string;
    };
    fullscreen: {
        active: boolean;
        titleFalse?: string;
        titleTrue?: string;
    };
    streetview: {
        active: boolean;
    };
    zoomControl: {
        active: boolean;
        zoomInTitle: string;
        zoomOutTitle: string;
    };
}

const components = {
    LMap,
    LTileLayer,
    LControlLayers,
    LControlZoom,
    LLayerGroup,
    LMarker,
    LGeoJson,
    LPopup,
    Sidebar,
    hatchPattern,
};

@Component({ components })
export default class Map extends Vue {
    protected map: L.Map | null = null;
    protected layersControl: L.Control.Layers | null = null;
    protected tileLayers: CsmTileLayer[] = [
        {
            name: "Satellite",
            visible: false,
            url: "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        },
        {
            name: "Plan",
            visible: true,
            url: "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        },
    ];
    protected mapOptions: object = {
        zoomControl: false,
    };
    protected tileLayerOptions: object = {
        maxZoom: 20,
        subdomains: [ "mt0" ],
    };
    protected defaultControlOptions: CsmMapControlFullOptions = {
        traffic: {
            active: false,
            name: "Traffic",
        },
        transit: {
            active: false,
            name: "Transit",
        },
        bike: {
            active: false,
            name: "Bicycle",
        },
        address: {
            active: false,
            name: "Address",
        },
        iris: {
            active: false,
            name: "Bicycle",
        },
        fullscreen: {
            active: false,
            titleFalse: "View Fullscreen",
            titleTrue: "Exit Fullscreen",
        },
        streetview: {
            active: false,
        },
        zoomControl: {
            active: false,
            zoomInTitle: "Zoom In",
            zoomOutTitle: "Zoom Out",
        },
    };
    protected overlayLayers: CsmOverlayLayers = {};
    protected drawer: L.Control.Draw | null = null;
    protected defaultDrawOptions: L.Control.DrawConstructorOptions = {
        position: "topleft",
        draw: {
            polyline: false,
            polygon: false,
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false,
        },
    };
    protected popupData: CsmPopupData | null = null;
    protected containerSize: Size = { height: 0, width: 0};

    @Prop({ type: String, default: "csm-map" }) protected id!: string;
    @Prop({ default: 10 }) protected zoom!: number;
    @Prop(Object) protected center!: L.LatLng;
    @Prop({ type: Number, default: 20 }) protected maxZoom!: number;
    @Prop({ default: (): Array<[number, number]> => [] }) protected bounds!: L.LatLngBounds | Array<[number, number]>;
    @Prop({ default: null }) protected cursor!: string | null;
    @Prop({ type: Array, default: () => [] }) protected data!: CsmDataMapLayer[];
    @Prop({ type: String, default: "" }) protected activeSidebarPane!: string;
    @Prop({ type: Object, default: () => ({}) }) protected drawerOptions!: L.Control.DrawConstructorOptions;
    @Prop({ type: Object, default: () => ({}) }) protected controlOptions!: CsmMapControlOptions;
    @Prop({ type: Object, default: () => ({}) }) protected popupOptions!: L.PopupOptions;

    protected mounted(): void {
        this.$nextTick(() => {
            this.map = _.get(this.$refs, "myMap.mapObject", null) as L.Map | null;
            this.layersControl = _.get(this.$refs, "layersControl.mapObject", null) as L.Control.Layers | null;

            if (null === this.map || null === this.layersControl) {
                return;
            }

            const mutantOptions: L.gridLayer.GoogleMutantOptions = {
                maxZoom: this.maxZoom,
                type: "roadmap",
            };
            if (this.fullControlOptions.traffic.active) {
                const trafficGridLayer: any = L.gridLayer.googleMutant(mutantOptions);
                trafficGridLayer.addGoogleLayer("TrafficLayer");
                this.layersControl.addBaseLayer(
                    trafficGridLayer,
                    this.fullControlOptions.traffic.name
                );
            }

            if (this.fullControlOptions.transit.active) {
                const transitGridLayer: any = L.gridLayer.googleMutant(mutantOptions);
                transitGridLayer.addGoogleLayer("TransitLayer");
                this.layersControl.addBaseLayer(transitGridLayer, this.fullControlOptions.transit.name);
            }

            if (this.fullControlOptions.bike.active) {
                const BicycleGridLayer: any = L.gridLayer.googleMutant(mutantOptions);
                BicycleGridLayer.addGoogleLayer("BicyclingLayer");
                this.layersControl.addBaseLayer(BicycleGridLayer, this.fullControlOptions.bike.name);
            }

            if (this.fullControlOptions.streetview.active) {
                (new L.Control.Pegman({
                    position: "bottomright",
                    clickableStreetViewLayer: false, // WARNING: when enabled it will violate Google ToS rules
                    theme: "leaflet-pegman-v3-small",
                })).addTo(this.map);
            }

            if (this.fullControlOptions.address.active) {
                const provider = new OpenStreetMapProvider();
                (new GeoSearchControl({
                    provider,
                    searchLabel: this.fullControlOptions.address.name,
                    marker: {
                        icon: Marker.getCustomMarkerSvgCode("#004aaa", 40, 40),
                        draggable: false,
                    },
                    position: "bottomright",
                })).addTo(this.map);
            }

            if (this.fullControlOptions.fullscreen.active) {
                this.map.addControl(_.invoke(L.control, "fullscreen", {
                    position: "bottomright",
                    title: {
                        false: this.fullControlOptions.fullscreen.titleFalse,
                        true: this.fullControlOptions.fullscreen.titleTrue,
                    }
                }));
            }

            if (this.fullControlOptions.iris.active) {
                const wmsLayer =
                    L.tileLayer.wms('https://wxs.ign.fr/an7nvfzojv5wa96dsga5nk8w/geoportail/v/wms?SERVICE=WMS&REQUEST=GetMap',
                        {
                            format: 'image/png',
                            transparent: true,
                            layers: 'STATISTICALUNITS.IRIS'
                        }
                    );
                this.layersControl.addBaseLayer(wmsLayer, 'IRIS');
            }

            this.updateOverlayLayersControl();
            this.handleDrawerOptionsChange();
            this.refreshContainerSize();
            if (null !== this.cursor) {
                L.DomUtil.addClass(this.map.getContainer(), `${this.cursor}-cursor`);
            }
        });
        console.log(this.data);
    }

    protected updated(): void {
        this.$nextTick(() => {
            this.refreshContainerSize();
        });
    }

    @Watch("cursor") public handleCursorChange(newCursor: string | null, oldCursor: string | null) {
        if (this.map) {
            if (null !== oldCursor) {
                L.DomUtil.removeClass(this.map.getContainer(), `${oldCursor}-cursor`);
            }
            if (null !== newCursor) {
                L.DomUtil.addClass(this.map.getContainer(), `${newCursor}-cursor`);
            }
        }
    }

    @Watch("data") public dataChangeDetected() {
        this.$nextTick(() => {
            this.updateOverlayLayersControl();
        });
    }

    @Watch("drawerOptions") public handleDrawerOptionsChange() {
        if (!this.map) {
            return;
        }
        if (this.drawer) {
            this.drawer.remove();
        }

        if (this.map) {
            this.drawer = new L.Control.Draw(_.merge(_.cloneDeep(this.defaultDrawOptions), this.drawerOptions));
            this.drawer.addTo(this.map);
        }
    }

    @Watch("containerSize") public handleContainerSizeChange() {
        if (this.map) {
            this.map.invalidateSize();
        }
    }

    protected get siderbarId() {
        return `sidebar-${this.id}`;
    }

    protected get hasSidebar(): boolean {
        return _.has(this.$slots, "sidebar");
    }

    protected get fullControlOptions(): CsmMapControlFullOptions {
        return _.merge(_.cloneDeep(this.defaultControlOptions), this.controlOptions);
    }

    protected refreshContainerSize(): void {
        this.containerSize = {
            height: this.$el.clientHeight,
            width: this.$el.clientWidth,
        };
    }

    protected updateOverlayLayersControl() {
        if (!this.layersControl) {
            return;
        }
        const layersControl = this.layersControl;
        let overlayLayerComponents = _.get(this.$refs, "overlayLayers", null) as Vue | Vue[] | null;

        if (!overlayLayerComponents) {
            if (this.overlayLayers) {
                _.forEach(this.overlayLayers, (overlayLayer: L.Layer) => {
                    layersControl.removeLayer(overlayLayer);
                });
            }
            this.overlayLayers = {};

            return;
        }

        if (!_.isArray(overlayLayerComponents)) {
            overlayLayerComponents = [ overlayLayerComponents ];
        }

        let deletableOverlaysControlIds = _.keys(this.overlayLayers);
        // Add new overlay to layer control
        _.forEach(overlayLayerComponents, (layerComponent: Vue, index: number) => {
            const overlayLayer = _.get(layerComponent, "mapObject", null) as L.Layer | null;
            if (!overlayLayer) {
                return;
            }

            if (_.get(this.data[index], "inLayerControl", true) && !_.has(this.overlayLayers, this.data[index].id)) {
                layersControl.addOverlay(overlayLayer, this.data[index].name);
                _.set(this.overlayLayers, this.data[index].id, overlayLayer);
            }
            deletableOverlaysControlIds = _.remove(deletableOverlaysControlIds, this.data[index].id);
        });

        // Remove non-used overlays from layer control
        _.forEach(deletableOverlaysControlIds, (id: string) => {
            layersControl.removeLayer(_.get(this.overlayLayers, id));
            _.unset(this.overlayLayers, id);
        });
    }

    protected addSidebarToMap(sidebar: L.Control.Sidebar) {
        if (this.map) {
            sidebar.addTo(this.map);
        }
    }

    protected handleSidebarTabChange(sidebarPaneId: string) {
        this.$emit("update:active-sidebar-pane", sidebarPaneId);
    }

    protected isMarker(representation: CsmMapObject): boolean {
        return Constants.MAP_OBJECT_TYPE.MARKER === representation.type;
    }

    protected isGeoJson(representation: CsmMapObject): boolean {
        return Constants.MAP_OBJECT_TYPE.GEOJSON === representation.type;
    }

    protected mapClick(event: L.LeafletMouseEvent) {
        this.$emit("map-click", event);
    }

    protected mapRightClick(event: L.LeafletMouseEvent) {
        this.$emit("map-right-click", event);
    }

    protected handleDraw(event: L.LeafletMouseEvent) {
        this.$emit("map-draw", event);
    }

    protected objectClick(
        representation: CsmMarker | CsmGeoJson,
        defaultLatLng: L.LatLng,
        dataLayerId: string
    ) {
        console.log(dataLayerId, representation, defaultLatLng);
        this.openPopUp(representation, defaultLatLng);
        const mapObjectEvent: CsmMapObjectEvent = {
            representation,
            latLng: [defaultLatLng.lat, defaultLatLng.lng],
            dataLayerId,
        };
        this.$emit("object-click", mapObjectEvent);
    }

    protected objectRightClick(
        representation: CsmMarker | CsmGeoJson,
        defaultLatLng: L.LatLng,
        dataLayerId: string
    ) {
        const mapObjectEvent: CsmMapObjectEvent = {
            representation,
            latLng: [defaultLatLng.lat, defaultLatLng.lng],
            dataLayerId,
        };
        this.$emit("object-right-click", mapObjectEvent);
    }

    protected bringToFront(dataLayerId: string) {
        // Récupérer la couche LayerGroup
        const layerGroup = this.overlayLayers[dataLayerId] as L.LayerGroup;
        if (layerGroup) {
            layerGroup.eachLayer((layer: L.Layer) => {
                if ((layer as Path).bringToFront) {
                    (layer as Path).bringToFront();
                }
            });
        }
    }

    protected openPopUp(representation: CsmMarker | CsmGeoJson, defaultLatLng: L.LatLng ) {
        if (null === _.get(representation, "popupData", null)) {
            return;
        }
        const popupLayer = _.get(this.$refs, "popupLayer.mapObject", null) as L.Layer | null;

        if (null === popupLayer) {
            return;
        }

        this.popupData = representation.popupData!;
        let latLng: L.LatLngExpression = defaultLatLng;

        if (this.isMarker(representation)) {
            latLng = (representation as CsmMarker).latLng;
        }

        this.$nextTick(() => {
            popupLayer.openPopup(latLng);
        });
    }
}
</script>
