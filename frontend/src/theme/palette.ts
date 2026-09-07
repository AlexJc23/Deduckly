// Compatibility palette for existing screens. Brand fills, photos, and chart series
// retain their colors; neutral surfaces and foregrounds adapt to appearance.
export function appearanceColor(value: unknown, property: string, dark: boolean): any {
    if (!dark || typeof value !== "string") return value;
    let color = value.toLowerCase();
    if (color === "white") color = "#ffffff";
    if (color === "black") color = "#000000";
    if (/^#[0-9a-f]{3}$/.test(color)) color = "#" + color.slice(1).split("").map(c => c + c).join("");
    if (!/^#[0-9a-f]{6}$/.test(color) || property === "shadowColor") return value;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    const brightness = (r + g + b) / 3;
    const background = property === "backgroundColor";
    const border = property.toLowerCase().includes("border");
    if (background || border) {
        if (brightness > 190 && r > b + 25 && g > b + 10) return border ? "#6A5633" : "#382F20";
        if (brightness > 190 && g > r + 5 && g > b + 5) return border ? "#32634F" : "#17382D";
        if (brightness > 190 && r > g + 5 && r > b + 5) return border ? "#724047" : "#40252D";
        if (min >= 220) return border ? "#344357" : (min >= 250 ? "#1B2635" : "#101722");
        if (brightness > 190) {
            if (g > r + 12 && g > b) return border ? "#32634F" : "#17382D";
            if (r > g + 12 && r > b + 12) return border ? "#724047" : "#40252D";
            if (r > b + 25 && g > b + 10) return border ? "#6A5633" : "#382F20";
            return border ? "#344357" : "#203449";
        }
        return value;
    }
    // Explicit white foregrounds belong to filled buttons and remain white.
    if (min >= 220) return value;
    if (max - min < 65) return brightness < 110 ? "#EDF3FA" : "#ACBACD";
    if (g > r * 1.25 && g > b * 0.85) return "#70D6AA";
    if (r > g * 1.45 && r > b * 1.2) return "#FF959C";
    if (r > b * 1.5 && g > b * 1.2) return "#EAC77E";
    if (b > r * 1.2) return "#71C7F2";
    return value;
}
