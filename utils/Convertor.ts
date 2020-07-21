import { LatLng } from "leaflet";

export default class Convertor {
    public static latLngToPolygon(coordinates: LatLng[]): Array<Array<[number, number]>> {
        const polygon: Array<[number, number]> = [];
        coordinates.forEach((latLng: LatLng) => {
            polygon.push([latLng.lng, latLng.lat]);
        });

        return [polygon];
    }
}
