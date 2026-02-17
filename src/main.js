/* ETCH - UI LOGIC (The Face) */
import { generateSVG } from './engine.js';

// Elements
const statusDot = document.getElementById('status-dot');
const hintText = document.querySelector('.hint');
const processBtn = document.getElementById('btn-process');
const shapeBtns = document.querySelectorAll('.shape-btn');

// State
let selectedShape = 'circle';
let currentImageData = null; // Base64 od Penpota
let imgWidth = 0;
let imgHeight = 0;

// 1. UI LISTENERS
shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        shapeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedShape = btn.dataset.shape;
    });
});

// Sliders UI update
['density', 'size', 'angle'].forEach(id => {
    const el = document.getElementById(id);
    const val = document.getElementById('val-' + id);
    el.addEventListener('input', () => {
        val.innerText = el.value + (id === 'angle' ? '°' : (id === 'size' ? 'x' : 'px'));
    });
});

// 2. LISTEN TO PENPOT BRAIN
window.addEventListener('message', (event) => {
    const msg = event.data;

    if (msg.type === 'selection-change') {
        if (msg.isValid) {
            statusDot.classList.add('active');
            hintText.innerText = "Processing selection...";
            processBtn.disabled = true; // Wait for image data
        } else {
            resetState();
        }
    }

    if (msg.type === 'image-data') {
        // Stigla je slika!
        currentImageData = msg.data;
        imgWidth = msg.width;
        imgHeight = msg.height;
        processBtn.disabled = false;
        hintText.innerText = "Ready to Vectorize";
    }
});

function resetState() {
    statusDot.classList.remove('active');
    processBtn.disabled = true;
    hintText.innerText = "Select an IMAGE to start.";
    currentImageData = null;
}

// 3. PROCESS & SEND BACK
processBtn.addEventListener('click', () => {
    if (!currentImageData) return;
    
    hintText.innerText = "Computing...";
    
    // Convert Base64 to Pixel Data for Engine
    const img = new Image();
    img.onload = () => {
        // Draw to invisible canvas to get pixels
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const pixelData = ctx.getImageData(0, 0, imgWidth, imgHeight).data;

        // Run the Engine
        const svg = generateSVG({
            shape: selectedShape,
            density: parseInt(document.getElementById('density').value),
            sizeMod: parseFloat(document.getElementById('size').value),
            angle: parseInt(document.getElementById('angle').value),
            transparent: document.getElementById('transparent').checked,
            invert: document.getElementById('invert').checked,
            width: imgWidth,
            height: imgHeight,
            pixelData: pixelData
        });

        // Send SVG back to Brain
        parent.postMessage({
            type: 'create-svg',
            svgString: svg,
            width: imgWidth,
            height: imgHeight
        }, '*');
        
        hintText.innerText = "Done! Check board.";
    };
    img.src = currentImageData;
});