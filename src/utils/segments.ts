// 按中英文句末标点把片段正文切成句子，保留原始空白，
// 使得所有句子 join('') 后能还原原文，便于拆分后重组。
export const splitSentences = (text: string): string[] => {
  const matches = text.match(/[^。！？!?；;…]+[。！？!?；;…]*\s*|\s+/g);
  return (matches ?? []).filter((item) => item.trim().length > 0);
};

// 合并两段正文：前段以中文或全角标点结尾时直接相接，否则补一个空格。
export const joinSegmentTexts = (a: string, b: string): string => {
  const left = a.trimEnd();
  const right = b.trimStart();
  if (!left) return right;
  if (!right) return left;
  return /[一-鿿　-〿＀-￠]$/.test(left) ? left + right : `${left} ${right}`;
};
