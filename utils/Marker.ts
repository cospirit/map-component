import L from "leaflet";
import {faBolt, faBullseye, faCompass, faFlag, faStar} from "@fortawesome/free-solid-svg-icons";

type Anchor = "center" | "bottom-center" | "bottom-left";
type MarkerVariant = "default" | "guidance" | "conquest" | "guerilla" | "priority";

export default class Marker {
    public static getCustomMarkerSvgCode(icon: string, width: number = 24, height: number = 24, anchorPosition: Anchor = "bottom-center", azimuth?: number): L.Icon | L.DivIcon {
        const preset = this.resolveMarkerPreset(icon);
        icon = preset.color ? preset.color : "#1B5E20";
        let url = icon;
        let svgCode = "";

        const reg = new RegExp("^#");
        if (reg.test(icon)) {
            if (azimuth !== null && azimuth !== undefined) {
                svgCode = this.buildMarkerSvg(icon, preset.variant, false);
            } else {
                url = "data:image/svg+xml;charset=utf-8," + this.buildMarkerSvg(icon, preset.variant, true);
            }
        }
        const iconAnchor: [number, number] = [Math.floor(width / 2), height];
        switch (anchorPosition) {
            case "bottom-left": {
                iconAnchor[0] = 0;
                break;
            }
            case "center": {
                iconAnchor[0] = Math.floor(width / 2);
                iconAnchor[1] = Math.floor(height / 2);
                break;
            }
        }

        if (azimuth !== null && azimuth !== undefined) {
            const notificationDiv = document.createElement('div');
            notificationDiv.className = 'notification-icon';
            notificationDiv.innerHTML = `<i class="el-icon-top" style="font-weight: bold; transform: rotate(${azimuth}deg);"></i>`;

            const iconDiv = document.createElement('div');
            iconDiv.innerHTML = svgCode;
            iconDiv.style.width = `${width}px`;
            iconDiv.style.height = `${height}px`;

            const containerDiv = document.createElement('div');
            containerDiv.appendChild(iconDiv);
            containerDiv.appendChild(notificationDiv);

            return L.divIcon({
                className: 'custom-marker-icon',
                html: containerDiv,
                iconAnchor
            });
        }

        if (preset.variant !== "default" && reg.test(icon)) {
            const pinContainer = document.createElement("div");
            pinContainer.style.position = "relative";
            pinContainer.style.width = `${width}px`;
            pinContainer.style.height = `${height}px`;

            const pinImage = document.createElement("img");
            pinImage.src = url;
            pinImage.style.width = "100%";
            pinImage.style.height = "100%";

            const markerFaIcon = this.getMarkerFaIcon(preset.variant);
            const centerIcon = document.createElement("span");
            const faWidth = markerFaIcon.icon[0];
            const faHeight = markerFaIcon.icon[1];
            const faPath = Array.isArray(markerFaIcon.icon[4]) ? markerFaIcon.icon[4][0] : markerFaIcon.icon[4];
            centerIcon.innerHTML = `<svg viewBox='0 0 ${faWidth} ${faHeight}' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><path fill='#FFFFFF' d='${faPath}'/></svg>`;
            centerIcon.style.position = "absolute";
            centerIcon.style.left = "50%";
            centerIcon.style.top = "42%";
            centerIcon.style.transform = "translate(-50%, -50%)";
            centerIcon.style.width = `${Math.max(12, Math.floor(width * 0.32))}px`;
            centerIcon.style.height = `${Math.max(12, Math.floor(width * 0.32))}px`;
            centerIcon.style.lineHeight = "1";

            pinContainer.appendChild(pinImage);
            pinContainer.appendChild(centerIcon);

            return L.divIcon({
                className: "custom-marker-icon",
                html: pinContainer,
                iconAnchor,
                iconSize: [width, height],
            });
        }

        return L.icon({
            iconUrl: url,
            iconAnchor,
            iconSize: [width, height],
        });

    }

    protected static resolveMarkerPreset(icon: string): { color: string; variant: MarkerVariant } {
        const normalizedIcon = (icon || "").toLowerCase().trim();

        if (normalizedIcon === "guidance") {
            return { color: "#3919D8", variant: "guidance" };
        }

        if (normalizedIcon === "conquest") {
            return { color: "#3919D8", variant: "conquest" };
        }

        if (normalizedIcon === "guerilla") {
            return { color: "#3919D8", variant: "guerilla" };
        }

        if(normalizedIcon === "priority") {
            return {color: "#E00E4A", variant: "priority"};
        }

        if (normalizedIcon === "default" || normalizedIcon === "board") {
            return { color: "#3919D8", variant: "default" };
        }

        return { color: icon, variant: "default" };
    }

    protected static buildMarkerSvg(color: string, variant: MarkerVariant, encodeColor: boolean): string {
        const fillColor = encodeColor ? `%23${color.replace("#", "")}` : color;
        const markerPath = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z";
        const innerGlyph = "";

        return `<svg height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path fill='${fillColor}' d='${markerPath}'/>${innerGlyph}</svg>`;
    }

    protected static getMarkerFaIcon(variant: MarkerVariant): any {
        switch (variant) {
            case "guidance":
                return faCompass;
            case "conquest":
                return faFlag;
            case "guerilla":
                return faBullseye;
            case 'priority':
                return faStar;
            default:
                return faBullseye;
        }
    }
}