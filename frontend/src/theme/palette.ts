// Shared brand tokens for navigation, surfaces, forms, and feature cards.
export const NAVY = {
 background: '#081320', card: '#102334', surface: '#142A3D', border: '#294157',
 text: '#F3F7FC', muted: '#9FB1C5', blue: '#2D6AF4', accent: '#50C7EF',
 green: '#35D779', active: '#0B2A24', activeBorder: '#24664F', danger: '#FF959C',
} as const;
// Compatibility palette for existing screens. Brand fills, photos, and chart series
// retain their colors; neutral surfaces and foregrounds adapt to appearance.
export function appearanceColor(value: unknown, property: string, dark: boolean): any {
    if (!dark || typeof value !== "string") return value;
    let color = value.toLowerCase();
    if (color === "white") color = "#ffffff";
    if (color === "black") color = "#000000";
    if (/^#[0-9a-f]{3}$/.test(color)) color = "#" + color.slice(1).split("").map(c => c + c).join("");
    if (!/^#[0-9a-f]{6}$/.test(color) || property === "shadowColor") return value;
    if (property === 'backgroundColor') {
        if (['#f8fafc','#f9fafb','#101722','#0f172a'].includes(color)) return NAVY.background;
        if (['#ffffff','#1b2635'].includes(color)) return NAVY.card;
        if (['#f1f5f9','#f3f4f6','#203449'].includes(color)) return NAVY.surface;
        if (['#4a6fe3','#0072b5','#4267d9'].includes(color)) return NAVY.blue;
        if (['#17382d','#f0fdf4'].includes(color)) return NAVY.active;
    }
    if (property.toLowerCase().includes('border') && ['#e2e8f0','#eef2f6','#344357','#cbd5e1','#8094a8','#94a3b8'].includes(color)) return NAVY.border;
    const [r, g, b] = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16));
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    const brightness = (r + g + b) / 3;
    const background = property === "backgroundColor";
    const border = property.toLowerCase().includes("border");
    if (background || border) {
        if (brightness > 190 && r > b + 25 && g > b + 10) return border ? "#6A5633" : "#382F20";
        if (brightness > 190 && g > r + 5 && g > b + 5) return border ? "#32634F" : NAVY.active;
        if (brightness > 190 && r > g + 5 && r > b + 5) return border ? "#724047" : "#40252D";
        if (min >= 220) return border ? NAVY.border : (min >= 250 ? NAVY.card : NAVY.background);
        if (brightness > 190) {
            if (g > r + 12 && g > b) return border ? "#32634F" : NAVY.active;
            if (r > g + 12 && r > b + 12) return border ? "#724047" : "#40252D";
            if (r > b + 25 && g > b + 10) return border ? "#6A5633" : "#382F20";
            return border ? NAVY.border : NAVY.surface;
        }
        return value;
    }
    // Explicit white foregrounds belong to filled buttons and remain white.
    if (min >= 220) return value;
    if (max - min < 65) return brightness < 110 ? NAVY.text : NAVY.muted;
    if (g > r * 1.25 && g > b * 0.85) return NAVY.green;
    if (r > g * 1.45 && r > b * 1.2) return "#FF959C";
    if (r > b * 1.5 && g > b * 1.2) return "#EAC77E";
    if (b > r * 1.2) return NAVY.accent;
    return value;
}
