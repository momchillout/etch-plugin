/* ETCH - BACKEND LOGIC (The Brain) */

penpot.ui.open("Etch Halftone", `?theme=${penpot.theme}`, {
  width: 320,
  height: 600
});

// Slušamo poruke iz UI-ja (index.html)
penpot.ui.onMessage(async (message) => {
  if (message.type === 'create-svg') {
    const { svgString, width, height } = message;

    if (!svgString) return;

    // Kreiramo grupu za vektor
    const group = penpot.createShapeFromSvg(svgString);
    
    if (group) {
      group.name = "Etch Vector";
      group.x = penpot.viewport.center.x - (width / 2);
      group.y = penpot.viewport.center.y - (height / 2);
      
      // Selektujemo novi oblik
      penpot.selection = [group];
    }
  }
});

// Kada korisnik klikne na nešto u Penpotu, javljamo UI-ju
penpot.on('selectionchange', () => {
  const selection = penpot.selection;
  if (selection.length === 1 && selection[0].type === 'image') {
    // Ako je slika, šaljemo podatke UI-ju
    penpot.ui.sendMessage({
      type: 'selection-change',
      isValid: true,
      name: selection[0].name,
      id: selection[0].id
    });
    // Moramo eksportovati sliku da bismo dobili piksele
    exportImageForProcessing(selection[0]);
  } else {
    penpot.ui.sendMessage({ type: 'selection-change', isValid: false });
  }
});

async function exportImageForProcessing(imageShape) {
  try {
    // Eksportujemo sliku kao PNG Blob
    const blob = await imageShape.export({ type: 'png', scale: 1 }); // Scale 1 za performanse
    const reader = new FileReader();
    
    reader.onload = function() {
      // Šaljemo Base64 string u UI da bi Engine mogao da ga pročita
      penpot.ui.sendMessage({
        type: 'image-data',
        data: reader.result,
        width: imageShape.width,
        height: imageShape.height
      });
    };
    reader.readAsDataURL(blob);
  } catch (err) {
    console.error("Export error:", err);
  }
}