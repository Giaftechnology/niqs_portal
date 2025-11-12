export type GlobalAlertDetail = { title?: string; message: string };

export const emitAlert = (message: string, title?: string) => {
  const detail: GlobalAlertDetail = { title, message };
  try {
    const evt = new CustomEvent('global-alert', { detail } as any);
    window.dispatchEvent(evt);
    document.dispatchEvent(evt);
  } catch {
    try { window.alert(title ? `${title}: ${message}` : message); } catch {}
  }
};
