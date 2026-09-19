import { createKaraokeNarrator, getVoices, type KaraokeNarrator, type WordTimingSample } from "../../src/index";
import "../../src/styles.css";
import "./style.css";

const byId = <T extends HTMLElement>(id: string) => document.querySelector<T>(`#${id}`)!;
const text = byId<HTMLTextAreaElement>("text"), voice = byId<HTMLSelectElement>("voice"), rate = byId<HTMLInputElement>("rate"), rateValue = byId<HTMLOutputElement>("rate-value"), caption = byId<HTMLDivElement>("caption"), rows = byId<HTMLTableSectionElement>("timings");
let narrator: KaraokeNarrator | undefined; let latest: ReturnType<KaraokeNarrator["getDiagnostics"]> | undefined;
function populateVoices() { const voices = getVoices(); voice.replaceChildren(...voices.map((item, index) => new Option(`${item.name} (${item.lang})`, String(index)))); voice.dataset.count = String(voices.length); }
populateVoices(); window.speechSynthesis?.addEventListener("voiceschanged", populateVoices);
rate.addEventListener("input", () => { rateValue.value = rate.value; });
function addRow(sample: WordTimingSample) { const row = document.createElement("tr"); for (const value of [sample.word, sample.predictedMs, sample.actualMs, sample.errorMs]) { const cell = document.createElement("td"); cell.textContent = typeof value === "number" ? `${value.toFixed(0)} ms` : value; row.append(cell); } rows.append(row); }
byId<HTMLButtonElement>("speak").onclick = () => { narrator?.cancel(); rows.replaceChildren(); const voices = getVoices(); narrator = createKaraokeNarrator({ text: text.value, target: caption, voice: voices[Number(voice.value)], rate: Number(rate.value), onWordTiming: addRow, onStateChange: (_state, detail) => { latest = detail?.diagnostics; } }); narrator.speak(); };
byId<HTMLButtonElement>("pause").onclick = () => narrator?.pause(); byId<HTMLButtonElement>("resume").onclick = () => narrator?.resume(); byId<HTMLButtonElement>("cancel").onclick = () => narrator?.cancel();
byId<HTMLButtonElement>("download").onclick = () => { const value = latest ?? narrator?.getDiagnostics(); if (!value) return; const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "karaoke-narrator-diagnostics.json"; link.click(); URL.revokeObjectURL(url); };
