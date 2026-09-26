import { For, Show, createEffect, createMemo, createSignal } from 'solid-js';
import { splitSentences, type useCodingStore } from '../store/coding-store';

type Store = ReturnType<typeof useCodingStore>;

export function SplitSegmentDialog(props: { store: Store; open: boolean; onClose: () => void }) {
  const [moved, setMoved] = createSignal<string[]>([]);
  const segment = createMemo(() => props.store.state.segments.find((item) => item.id === props.store.state.activeSegmentId));
  const sentences = createMemo(() => splitSentences(segment()?.text ?? ''));
  const remaining = createMemo(() => sentences().filter((sentence) => !moved().includes(sentence)));
  const movedList = createMemo(() => sentences().filter((sentence) => moved().includes(sentence)));

  createEffect(() => {
    if (props.open) setMoved([]);
  });

  const toggle = (sentence: string, checked: boolean) => {
    setMoved((items) => checked ? [...items, sentence] : items.filter((item) => item !== sentence));
  };

  const submit = () => {
    const current = segment();
    if (!current) return;
    if (props.store.splitSegment(current.id, moved())) props.onClose();
  };

  return (
    <div class="modal-backdrop" classList={{ hidden: !props.open }} onClick={props.onClose}>
      <section class="modal-card wide" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header><div><span class="eyebrow">SEGMENT</span><h2>拆分片段</h2></div><button class="modal-close" onClick={props.onClose}>×</button></header>
        <p class="modal-intro">勾选要挪到新片段的句子，新片段紧随其后。两位编码者的主题判断与片段备忘会随内容复制到新片段，可随后分别调整；操作可撤销。</p>
        <Show when={sentences().length > 1} fallback={<div class="empty-state">当前片段只有一句，无法再拆分。</div>}>
          <div class="split-list">
            <For each={sentences()}>{(sentence, index) => (
              <label class="split-item">
                <input type="checkbox" checked={moved().includes(sentence)} onChange={(event) => toggle(sentence, event.currentTarget.checked)} />
                <span>句 {index() + 1}<small>{sentence}</small></span>
              </label>
            )}</For>
          </div>
          <div class="split-preview">
            <div><strong>原片段保留 {remaining().length} 句</strong><p>{remaining().join('') || '（不能为空）'}</p></div>
            <div><strong>新片段 {movedList().length} 句</strong><p>{movedList().join('') || '（尚未选择句子）'}</p></div>
          </div>
        </Show>
        <footer>
          <button class="button secondary" onClick={props.onClose}>取消</button>
          <button class="button primary" disabled={!moved().length || !remaining().length} onClick={submit}>拆分为两段</button>
        </footer>
      </section>
    </div>
  );
}
