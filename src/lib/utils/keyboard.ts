export function isTypingInInput(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;
  const tagName = activeElement.tagName.toLowerCase();
  if (tagName === 'input') {
    const input = activeElement as HTMLInputElement;
    const type = input.type?.toLowerCase() || 'text';
    const textTypes = ['text', 'email', 'password', 'search', 'url', 'tel', 'number'];
    return textTypes.includes(type);
  }
  if (tagName === 'textarea') return true;
  if (activeElement.getAttribute('contenteditable') === 'true') return true;
  return false;
}

export const DEFAULT_SHORTCUTS = {
  TOGGLE_OVERLAY: { key: '1', modifiers: ['alt'], description: 'Toggle overlay (when not typing)' },
  TOGGLE_OVERLAY_NUMBER: { key: '1', description: 'Toggle overlay with number key' },
};