let n = 0;
/** A fresh id for something made on this computer. */
export const newId = (kind: string) => `${kind}-${Date.now().toString(36)}-${(n += 1)}`;
