import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

function browserStorage() {
  if (Platform.OS !== 'web') return null;

  try {
    return globalThis.localStorage || null;
  } catch {
    return null;
  }
}

export async function getStoredValue(key) {
  if (Platform.OS === 'web') {
    return browserStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

export async function setStoredValue(key, value) {
  if (Platform.OS === 'web') {
    browserStorage()?.setItem(key, value);
    return;
  }

  return SecureStore.setItemAsync(key, value);
}

export async function deleteStoredValue(key) {
  if (Platform.OS === 'web') {
    browserStorage()?.removeItem(key);
    return;
  }

  return SecureStore.deleteItemAsync(key);
}
