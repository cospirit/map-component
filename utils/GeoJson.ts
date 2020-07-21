import { GeoJSONOptions } from "leaflet";
import { CsmGeoJson, CsmPopupData } from "../components/map/Map.vue";
import MapConstants from "./Constants";
import {
    Feature,
    Position,
    Polygon,
    MultiPolygon
} from "geojson";

export interface Properties {
    code: string | null;
    [key: string]: any;
}

export interface GeoPortalJson {
    type: string;
    coordinates: Array<[number, number]>;
}

type GeometryType = "Polygon" | "MultiPolygon";

export default class GeoJson {
    public static createGeoJsonFeature(
        zone: Position[]|Position[][],
        popupData: CsmPopupData | null,
        properties: Properties | null,
        color: string,
        opacity: number = 1,
        type: GeometryType = "Polygon",
        weight: number = 1,
    ): CsmGeoJson {

        const options: GeoJSONOptions = {
            style: { color, opacity, weight },
        };

        const geoJson: Feature<Polygon | MultiPolygon | null> = {
            type: "Feature",
            properties,
            geometry: null,
        };

        if ("MultiPolygon" === type) {
            const geometry: MultiPolygon = {
                type,
                coordinates: [
                    zone as Position[][],
                ],
            };
            geoJson.geometry = geometry;
        } else if ("Polygon" === type) {
            const geometry: Polygon = {
                type,
                coordinates: [
                    zone as Position[],
                ],
            };
            geoJson.geometry = geometry;
        }

        return {
            type: MapConstants.MAP_OBJECT_TYPE.GEOJSON,
            popupData,
            options,
            geoJson,
        };
    }

    public static toJson(strWkt: string): GeoPortalJson {
        // regex coordinates
        let regex = /(-?\d+\.?[0-9]*)\s(-?\d+\.?[0-9]+)/g;
        let subst = "[$1,$2]";
        strWkt = strWkt.replace(regex, subst);

        // regex type
        regex = /^(\w+)/;
        regex.exec(strWkt);

        subst = "{\"type\" : \"Polygon\",";
        strWkt = strWkt.replace(RegExp.$1, subst);
        // clean
        // (( --> coordinates : [[
        regex = /(\({2}?)/;
        subst = "\"coordinates\" : [[";
        strWkt = strWkt.replace(regex, subst);
        // )) --> ]]}
        regex = /(\){2}?)/;
        subst = "]]}";
        strWkt = strWkt.replace(regex, subst);
        // all ( --> [
        regex = /(\()/g;
        subst = "[";
        strWkt = strWkt.replace(regex, subst);
        // all ) --> ]
        regex = /(\))/g;
        subst = "]";
        strWkt = strWkt.replace(regex, subst);

        return JSON.parse(strWkt);
    }
}
