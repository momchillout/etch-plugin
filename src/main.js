document.addEventListener("DOMContentLoaded", () => {
    console.log("UI je uspešno učitan i spreman!");

    const densityInput = document.getElementById('density');
    const densityVal = document.getElementById('val-density');
    const sizeInput = document.getElementById('size');
    const sizeVal = document.getElementById('val-size');
    const angleInput = document.getElementById('angle');
    const angleVal = document.getElementById('val-angle');
    
    const generateBtn = document.getElementById('btn-generate');
    const selectionMsg = document.getElementById('selection-msg');
    const statusDot = document.getElementById('status-dot');
    
    const shapeBtns = document.querySelectorAll('.shape-btn');

    let currentImageData = null;
    let selectedShape = 'circle';

    // Oživljavanje UI elemenata
    if (densityInput && densityVal) {
        densityInput.addEventListener('input', (e) => { densityVal.textContent = e.target.value + 'px'; });
    }
    if (sizeInput && sizeVal) {
        sizeInput.addEventListener('input', (e) => { sizeVal.textContent = parseFloat(e.target.value).toFixed(1) + 'x'; });
    }
    if (angleInput && angleVal) {
        angleInput.addEventListener('input', (e) => { angleVal.textContent = e.target.value + '°'; });
    }

    // Biranje oblika
    shapeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            shapeBtns.forEach(b => b.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');
            selectedShape = target.getAttribute('data-shape');
        });
    });

    // Komunikacija sa Penpotom
    window.addEventListener('message', (event) => {
        const msg = event.data;

        if (msg.type === 'selection-change') {
            if (msg.isValid) {
                selectionMsg.textContent = "Image selected. Ready!";
                selectionMsg.style.color = "#00d084";
                statusDot.style.color = "#00d084";
                generateBtn.disabled = false;
                generateBtn.style.opacity = "1";
            } else {
                selectionMsg.textContent = "Select an image on board";
                selectionMsg.style.color = "#666";
                statusDot.style.color = "#555";
                generateBtn.disabled = true;
                generateBtn.style.opacity = "0.3";
                currentImageData = null;
            }
        }

        if (msg.type === 'image-data') {
            currentImageData = msg;
        }
    });

    // KLIK NA GENERATE DUGME
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (!currentImageData) return;
            
            generateBtn.textContent = "GENERATING...";
            generateBtn.style.opacity = "0.5";

            // Moramo pretvoriti Base64 sliku u Canvas piksele
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = currentImageData.width;
                canvas.height = currentImageData.height;
                ctx.drawImage(img, 0, 0);
                
                // Izvlačimo pixel array (Uint8ClampedArray)
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Zovemo tvoju funkciju iz engine.js
                const finalSvg = generateSVG({
                    shape: selectedShape,
                    density: densityInput ? densityInput.value : 12,
                    sizeMod: sizeInput ? sizeInput.value : 1.0,
                    angle: angleInput ? angleInput.value : 0,
                    transparent: true,
                    invert: false,
                    width: canvas.width,
                    height: canvas.height,
                    pixelData: imgData.data
                });

                // Šaljemo gotov vektor nazad u Penpot
                parent.postMessage({
                    type: 'create-svg',
                    svgString: finalSvg,
                    width: canvas.width,
                    height: canvas.height
                }, '*');

                generateBtn.textContent = "GENERATE VECTOR";
                generateBtn.style.opacity = "1";
            };
            
            // Učitavamo sliku poslatu iz Penpota
            img.src = currentImageData.data;
        });
    }
});
