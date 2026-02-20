// Čekamo da se kompletan HTML učita pre nego što pokrenemo logiku
document.addEventListener("DOMContentLoaded", () => {
    console.log("UI je uspešno učitan i spreman!");

    // 1. Preuzimanje svih elemenata iz interfejsa
    const densityInput = document.getElementById('density');
    const densityVal = document.getElementById('val-density');
    const sizeInput = document.getElementById('size');
    const sizeVal = document.getElementById('val-size');
    const angleInput = document.getElementById('angle');
    const angleVal = document.getElementById('val-angle');
    
    const generateBtn = document.getElementById('btn-generate');
    const selectionMsg = document.getElementById('selection-msg');
    const statusDot = document.getElementById('status-dot');

    let currentImageData = null;

    // 2. Oživljavanje slajdera (da se menjaju brojke)
    if (densityInput && densityVal) {
        densityInput.addEventListener('input', (e) => {
            densityVal.textContent = e.target.value + 'px';
        });
    }

    if (sizeInput && sizeVal) {
        sizeInput.addEventListener('input', (e) => {
            sizeVal.textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });
    }

    if (angleInput && angleVal) {
        angleInput.addEventListener('input', (e) => {
            angleVal.textContent = e.target.value + '°';
        });
    }

    // 3. Komunikacija sa Penpotom (Hvatanje selektovane slike)
    window.addEventListener('message', (event) => {
        const msg = event.data;

        // Penpot nam javlja da li je slika selektovana
        if (msg.type === 'selection-change') {
            if (msg.isValid) {
                // Slika je selektovana -> Palimo zeleno svetlo i dugme
                selectionMsg.textContent = "Image selected. Ready!";
                selectionMsg.style.color = "#00d084";
                statusDot.style.color = "#00d084";
                generateBtn.disabled = false;
                generateBtn.style.opacity = "1";
            } else {
                // Ništa nije selektovana -> Gasimo dugme
                selectionMsg.textContent = "Select an image on board";
                selectionMsg.style.color = "#666";
                statusDot.style.color = "#555";
                generateBtn.disabled = true;
                generateBtn.style.opacity = "0.3";
            }
        }

        // Penpot nam šalje samu sliku (blob/base64)
        if (msg.type === 'image-data') {
            currentImageData = msg;
            console.log("Slika uspešno primljena u UI!");
        }
    });

    // 4. Klik na dugme GENERATE VECTOR
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            if (!currentImageData) return;
            
            // Menjamo tekst dugmeta dok se procesira
            generateBtn.textContent = "GENERATING...";
            
            // OVDE IDE TVOJA LOGIKA IZ engine.js (renderHalftone itd.)
            // Pošto ne znam tvoju tačnu funkciju, simuliramo generisanje 
            // i šaljemo test krug nazad u Penpot čisto da potvrdimo da sve radi.
            
            setTimeout(() => {
                const testSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#00d084" /></svg>`;
                
                // Šaljemo gotov SVG nazad u Penpot (src/plugin.js) da ga nacrta na ekranu
                parent.postMessage({
                    type: 'create-svg',
                    svgString: testSvg,
                    width: 100,
                    height: 100
                }, '*');
                
                // Vraćamo tekst dugmeta na staro
                generateBtn.textContent = "GENERATE VECTOR";
            }, 500); // Simuliramo pauzu od pola sekunde
        });
    }
});
