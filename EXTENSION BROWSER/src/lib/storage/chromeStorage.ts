export async function getStorageValue<T>(key: string, defaultValue: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? defaultValue);
    });
  });
}

export async function setStorageValue<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => resolve());
  });
}

export const STORAGE_KEYS = {
  AI_PROVIDER: 'aiProvider',
  API_KEY: 'apiKey',
  AI_MODEL: 'aiModel',
  ENABLE_NUMBER_KEY: 'enableNumberKeyShortcut',
} as const;