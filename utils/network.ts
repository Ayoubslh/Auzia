import * as Network from 'expo-network';
import { useToastStore } from '../store/toastStore';

export async function isConnected(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return !!(state.isConnected && state.isInternetReachable !== false);
  } catch {
    return true;
  }
}

export async function requireConnection(message = 'Pas de connexion internet'): Promise<boolean> {
  const connected = await isConnected();
  if (!connected) {
    useToastStore.getState().show(message);
  }
  return connected;
}
