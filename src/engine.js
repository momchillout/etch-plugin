/* ETCH PLUGIN - CORE SVG ENGINE */

/**
 * Konvertuje piksele u SVG Vektor string
 * @param {Object} params - Parametri iz UI-ja
 * @returns {String} - Kompletan SVG kod
 */
function generateSVG(params) {
    const {
        shape, density, sizeMod, angle, transparent, invert, width, height, pixelData
    } = params;

    if (!pixelData || width === 0 || height === 0) {
        console.warn("Etch: Nema pixel data, vracam prazan SVG.");
        return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>`;
    }

    let svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;

    const step = parseInt(density);
    const mod = parseFloat(sizeMod);
    const rot = parseInt(angle);

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const i = (Math.floor(y) * width + Math.floor(x)) * 4;
            if (i >= pixelData.length) continue;

            const r = pixelData[i];
            const g = pixelData[i + 1];
            const b = pixelData[i + 2];
            const a = pixelData[i + 3];

            if (a < 50) continue; 
            if (transparent) {
                if (r > 240 && g > 240 && b > 240) continue;
            }

            const brightness = (r + g + b) / 3;
            let norm = brightness / 255; 

            if (!invert) {
                norm = 1 - norm;
            }

            const size = step * norm * mod;
            if (size < 0.5) continue;

            const hexColor = rgbToHex(r, g, b);
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
                svgString += `  <line x1="${x - s}" y1="${y}" x2="${x + s}" y2="${y}" stroke="${hexColor}" stroke-width="${size.toFixed(2)}" stroke-linecap="round"${transform} />\n`;
            } 
            else if (shape === 'cross') {
                const s = (size / 2).toFixed(2);
                const w = (size / 4).toFixed(2); 
                const d = `M ${x-s} ${y} L ${x+s} ${y} M ${x} ${y-s} L ${x} ${y+s}`;
                svgString += `  <path d="${d}" stroke="${hexColor}" stroke-width="${w}" stroke-linecap="round"${transform} />\n`;
            }
        }
    }

    svgString += `</svg>`;
    return svgString;
}

function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}
