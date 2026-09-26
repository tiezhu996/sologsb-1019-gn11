import { For, createEffect, createMemo, createSignal } from 'solid-js';
import type { useCodingStore } from '../store/coding-store';
import { splitSentences } from '../utils/segments';

type Store = ReturnType<typeof useCodingStore>;

export function SplitSegmentDialog(props: { store: Store; segmentId: string | null; onClose: () => void }) {
  const [moved, setMoved] = createSignal<number[]>([]);
  const segment = createMemo(() => props.store.state.segments.find((item) => item.id === props.segmentId));
  const sentences = createMemo(() => splitSentences(segment()?.text ?? ''));

  createEffect(() => {
    if (props.segmentId) setMoved([]);
  });

  const toggle = (index: number, checked: boolean) => {
    setMoved((items) => checked ? [...items, index] : items.filter((item) => item !== index));
  };

  const submit = () => {
    const current = segment();
    if (!current) return;
    props.store.splitSegment(current.id, moved());
    setMoved([]);
    props.onClose();
  };

  return (
    <div class="modal-backdrop" classList={{ hidden: !props.segmentId }} onClick={props.onClose}>
      <section class="modal-card wide" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header><div><span class="eyebrow">SPLIT SEGMENT</span><h2>拆分片段</h2></div><button class="modal-close" onClick={props.onClose}>×</button></header>
        <p class="modal-intro">勾选要挪到新片段的句子，其余句子留在原片段。两位编码者的主题判断和片段备忘会同时保留在两段上，新片段紧跟原片段之后，可撤销。</p>
        <div class="split-list">
          <For each={sentences()}>{(sentence, index) => (
            <label class="split-item">
              <input type="checkbox" checked={moved().includes(index())} onChange={(event) => toggle(index(), event.currentTarget.checked)} />
              <span>第 {index() + 1} 句<small>{sentence.trim()}</small></span>
            </label>
          )}</For>
        </div>
        <div class="split-preview">原片段保留 {sentences().length - moved().length} 句 · 新片段 {moved().length} 句</div>
        <footer>
          <button class="button secondary" onClick={props.onClose}>取消</button>
          <button class="button primary" disabled={!moved().length || moved().length === sentences().length} onClick={submit}>拆分为两段</button>
        </footer>
      </section>
    </div>
  );
}
