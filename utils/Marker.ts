import L from "leaflet";

type Anchor = "center" | "bottom-center" | "bottom-left";

export default class Marker {
    public static getCustomMarkerSvgCode(icon: string, width: number = 24, height: number = 24, anchorPosition: Anchor = "bottom-center", azimuth?: number): L.Icon | L.DivIcon {
        icon = icon ? icon : "#1B5E20";
        let url = icon;
        let svgCode = "";

        const reg = new RegExp("^#");
        if (reg.test(icon)) {
            if (azimuth !== null && azimuth !== undefined) {
                svgCode = "<svg height='40' viewBox='0 0 24 24' width='40' xmlns='http://www.w3.org/2000/svg'>" +
                    "<path fill='" + icon + "' d='M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 Z'/>" +
                    "</svg>";
            } else {
                url = "data:image/svg+xml;charset=utf-8," +
                    "<svg height='24' viewBox='0 0 24 24' width='24' xmlns=\"http://www.w3.org/2000/svg\" " +
                    "style='fill: %23" + icon.substr(1) + "'>" + // %23 is encoded # (because # is reserved in url)
                    "<path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm09.5c-1.38 " +
                    "0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>" +
                    "</svg>";
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
                html: containerDiv
            });
        }
        return L.icon({
            iconUrl: url,
            iconAnchor,
            iconSize: [width, height],
        });

    }
}