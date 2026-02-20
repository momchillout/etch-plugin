/* MOZAK PLUGINA - src/plugin.js */

// Koristimo punu putanju do root-a gde je index.html
const uiUrl = "https://momchillout.github.io/etch-plugin/index.html";

penpot.ui.open("Etch Halftone", `${uiUrl}?theme=${penpot.theme}`, {
  width: 320,
  height: 600
});

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

penpot.on('selectionchange', () => {
  const selection = penpot.selection;
  if (selection.length === 1 && selection[0].type === 'image') {
    exportImage(selection[0]);
  } else {
    penpot.ui.sendMessage({ type: 'selection-change', isValid: false });
  }
});

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
