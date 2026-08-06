/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(unsafe: string | null | undefined): string {
  if (!unsafe) return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return unsafe.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize user input for safe HTML display
 */
export function sanitizeHtmlInput(input: string): string {
  return escapeHtml(input);
}
