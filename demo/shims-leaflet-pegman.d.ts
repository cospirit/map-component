import * as L from "leaflet";

declare module "leaflet" {
    namespace Control {
        class Pegman extends Control {
            constructor(options?: any);
        }
    }
}
