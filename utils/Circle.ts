import { LatLng } from "leaflet";
import Convertor from "./Convertor";

export default class Circle {
    // Generate circle from center and radius for leaflet
    public static generateMapCircle(
        center: LatLng,
        radius: number,
        nbPoints: number = 100,
        polygon: boolean = false
    ): any {
        const d2r = Math.PI / 180; // degrees to radians
        const r2d = 180 / Math.PI; // radians to degrees

        // find the radius in lat/lon
        const rlat = r2d * radius / 6372800; // 6372800 is the radius of the earth in meters
        const rlng = rlat / Math.cos(center.lat * d2r);

        const circle = [];
        for (let i = 0; i < nbPoints + 1; i++) {
            const theta = Math.PI * (i / (nbPoints / 2));
            const lng = center.lng + (rlng * Math.cos(theta)); // center a + radius x * cos(theta)
            const lat = center.lat + (rlat * Math.sin(theta)); // center b + radius y * sin(theta)
            circle.push(new LatLng(lat, lng));
        }

        if (polygon) {
            return Convertor.latLngToPolygon(circle);
        }

        return circle;
    }
}
