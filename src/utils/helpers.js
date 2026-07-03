export function getRiskColor(total) {
  if (total > 400) return '#dc2626'; // Red   – Major Risk
  if (total > 150) return '#eab308'; // Yellow – Minor Risk
  return '#2563eb';                  // Blue   – No / Low Risk
}

export async function fetchWithRetry(url, options = {}, retries = 3, delay = 200) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res;
  } catch (error) {
    if (options.signal && options.signal.aborted) {
      throw error;
    }
    if (retries <= 1) {
      throw error;
    }
    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(resolve, delay);
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
          reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      }
    });
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}
