/* MOZAK PLUGINA - Nalazi se u src/ folderu */

// PAŽNJA: Koristimo "../index.html" jer je HTML u folderu iznad (root)
penpot.ui.open("Etch Halftone", "../index.html?theme=" + penpot.theme, {
  width: 320,
  height: 600
});

// Slušanje poruka iz UI-ja (iz main.js/engine.js)
penpot.ui.onMessage((message) => {
  if (message.type === 'create-svg') {
    const group = penpot.createShapeFromSvg(message.svgString);
    if (group) {
      group.name = "Etch Vector";
      group.x = penpot.viewport.center.x - (message.width / 2);
      group.y = penpot.viewport.center.y - (message.height / 2);
      penpot.selection = [group];
    }
  }
});

// Detekcija selekcije slike na board-u
penpot.on('selectionchange', () => {
  const selection = penpot.selection;
  if (selection.length === 1 && selection[0].type === 'image') {
    exportImage(selection[0]);
  } else {
    penpot.ui.sendMessage({ type: 'selection-change', isValid: false });
  }
});

// Funkcija za eksport slike i slanje u UI procesor
async function exportImage(shape) {
  try {
    penpot.ui.sendMessage({ type: 'selection-change', isValid: true });
    const blob = await shape.export({ type: 'png', scale: 1 });
    const reader = new FileReader();
    reader.onload = () => {
      penpot.ui.sendMessage({
        type: 'image-data',
        data: reader.result,
        width: shape.width,
        height: shape.height
      });
    };
    reader.readAsDataURL(blob);
  } catch (e) {
    console.error("Greška pri eksportu slike:", e);
  }
}
