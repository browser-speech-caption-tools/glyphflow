import {
  createKaraokeNarrator,
  getSpeechSynthesisSupport,
  getVoices,
  type KaraokeNarrator,
  type WordTimingSample,
} from "@enumura/glyphflow";
import "./style.css";

const byId = <T extends HTMLElement>(id: string) =>
  document.querySelector<T>(`#${id}`)!;
const text = byId<HTMLTextAreaElement>("text"),
  voice = byId<HTMLSelectElement>("voice"),
  rate = byId<HTMLInputElement>("rate"),
  rateValue = byId<HTMLOutputElement>("rate-value"),
  caption = byId<HTMLDivElement>("caption"),
  rows = byId<HTMLTableSectionElement>("timings"),
  status = byId<HTMLParagraphElement>("status");
let narrator: KaraokeNarrator | undefined;
let latest: ReturnType<KaraokeNarrator["getDiagnostics"]> | undefined;
function populateVoices() {
  const voices = getVoices();
  voice.replaceChildren(
    ...(voices.length
      ? voices.map(
          (item, index) => new Option(`${item.name} (${item.lang})`, String(index)),
        )
      : [new Option("No voices available yet", "")]),
  );
}
const support = getSpeechSynthesisSupport();
if (!support.supported) status.textContent = `Unsupported: ${support.reason}`;
populateVoices();
window.speechSynthesis?.addEventListener("voiceschanged", populateVoices);
rate.addEventListener("input", () => {
  rateValue.value = rate.value;
});
function addRow(sample: WordTimingSample) {
  const row = document.createElement("tr");
  for (const value of [
    sample.word,
    sample.predictedMs,
    sample.actualMs,
    sample.errorMs,
  ]) {
    const cell = document.createElement("td");
    cell.textContent = typeof value === "number" ? `${value.toFixed(0)} ms` : value;
    row.append(cell);
  }
  rows.append(row);
}
byId<HTMLButtonElement>("speak").onclick = () => {
  narrator?.destroy();
  rows.replaceChildren();
  latest = undefined;
  const voices = getVoices();
  narrator = createKaraokeNarrator({
    text: text.value,
    target: caption,
    voice: voice.value ? voices[Number(voice.value)] : undefined,
    rate: Number(rate.value),
    onWordTiming: addRow,
    onStateChange: (state, detail) => {
      latest = detail?.diagnostics;
      status.textContent = detail?.reason ? `${state}: ${detail.reason}` : state;
    },
  });
  narrator.speak();
};
byId<HTMLButtonElement>("pause").onclick = () => narrator?.pause();
byId<HTMLButtonElement>("resume").onclick = () => narrator?.resume();
byId<HTMLButtonElement>("cancel").onclick = () => narrator?.cancel();
byId<HTMLButtonElement>("download").onclick = () => {
  const value = latest ?? narrator?.getDiagnostics();
  if (!value) return;
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "glyphflow-diagnostics.json";
  link.click();
  URL.revokeObjectURL(url);
};
