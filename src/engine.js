/* ETCH PLUGIN - CORE SVG ENGINE */

/**
 * Konvertuje piksele u SVG Vektor string
 * @param {Object} params - Parametri iz UI-ja
 * @returns {String} - Kompletan SVG kod
 */
export function generateSVG(params) {
    const {
        shape,
        density,
        sizeMod,
        angle,
        transparent,
        invert,
        width,
        height,
        pixelData // Ovo mora biti Uint8ClampedArray (RGBA)
    } = params;

    // Ako nema podataka (npr. dok testiramo UI), izbaci prazan SVG
    if (!pixelData || width === 0 || height === 0) {
        console.warn("Etch: Nema pixel data, vracam prazan SVG.");
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>`;
    }

    // Započinjemo SVG string
    let svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;

    // Optimizacija: Keširamo matematičke operacije
    const step = parseInt(density);
    const mod = parseFloat(sizeMod);
    const rot = parseInt(angle);

    // Glavna petlja: Prolazimo kroz grid (mrežu)
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            
            // Nalazimo tačan indeks piksela u 1D nizu (RGBA)
            const i = (Math.floor(y) * width + Math.floor(x)) * 4;
            
            // Preskačemo ako smo van granica niza
            if (i >= pixelData.length) continue;

            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            const a = pixelData[i + 3];

            // 1. IGNORE BACKGROUND (Transparent & White check)
            if (a < 50) continue; // Potpuno providno
            if (transparent) {
                // Ako je skoro belo, preskoči (štedi hiljade čvorova u Penpotu)
                if (r > 240 && g > 240 && b > 240) continue;
            }

            // 2. LUMINANCE (Osvetljenost)
            const brightness = (r + g + b) / 3;
            let norm = brightness / 255; // 0 = Crno, 1 = Belo

            // Ako nije invertovano, tamniji piksel = veći oblik
            if (!invert) {
                norm = 1 - norm;
            }

            // 3. SIZE CALCULATION
            const size = step * norm * mod;
            
            // Preskačemo mikroskopske oblike (Performansni trik)
            if (size < 0.5) continue;

            // 4. COLOR FORMATTING (HEX)
            const hexColor = rgbToHex(r, g, b);

            // 5. SHAPE GENERATION
            // Koristimo <g> (group) za lakšu rotaciju oko centra ako treba
            const transform = rot > 0 ? ` transform="rotate(${rot}, ${x}, ${y})"` : ``;

            if (shape === 'circle') {
                svgString += `  <circle cx="${x}" cy="${y}" r="${(size / 2).toFixed(2)}" fill="${hexColor}" />\n`;
            } 
            else if (shape === 'rect') {
                const s = size.toFixed(2);
                const offset = (size / 2).toFixed(2);
                svgString += `  <rect x="${x - offset}" y="${y - offset}" width="${s}" height="${s}" fill="${hexColor}"${transform} />\n`;
            } 
            else if (shape === 'line') {
                const s = (size / 2).toFixed(2);
                // Crtamo liniju i dodajemo debljinu
                svgString += `  <line x1="${x - s}" y1="${y}" x2="${x + s}" y2="${y}" stroke="${hexColor}" stroke-width="${size.toFixed(2)}" stroke-linecap="round"${transform} />\n`;
            } 
            else if (shape === 'cross') {
                const s = (size / 2).toFixed(2);
                const w = (size / 4).toFixed(2); // Debljina kraka
                // Koristimo <path> za krstić, daleko brže nego crtanje dva <rect> elementa
                const d = `M ${x-s} ${y} L ${x+s} ${y} M ${x} ${y-s} L ${x} ${y+s}`;
                svgString += `  <path d="${d}" stroke="${hexColor}" stroke-width="${w}" stroke-linecap="round"${transform} />\n`;
            }
        }
    }

    // Zatvaramo SVG
    svgString += `</svg>`;

    return svgString;
}

/**
 * Pomoćna funkcija: Pretvara RGB u HEX za čistiji SVG kod
 */
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}