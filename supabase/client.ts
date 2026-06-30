import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRandomBytes, digestStringAsync, CryptoDigestAlgorithm, CryptoEncoding } from 'expo-crypto';

// Polyfill crypto for Hermes (React Native) — required for Supabase PKCE sha256
if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = {};
}
if (!(global as any).crypto.getRandomValues) {
  (global as any).crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => {
    const bytes = getRandomBytes((array as Uint8Array).byteLength);
    (array as Uint8Array).set(bytes);
    return array;
  };
}
if (!(global as any).crypto.subtle) {
  (global as any).crypto.subtle = {
    digest: async (_algorithm: string, data: Uint8Array | ArrayBuffer): Promise<ArrayBuffer> => {
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
      // PKCE verifier is always ASCII — TextDecoder is safe here
      const str = new TextDecoder().decode(bytes);
      const hashHex = await digestStringAsync(CryptoDigestAlgorithm.SHA256, str, {
        encoding: CryptoEncoding.HEX,
      });
      const result = new Uint8Array(hashHex.length / 2);
      for (let i = 0; i < hashHex.length; i += 2) {
        result[i / 2] = parseInt(hashHex.slice(i, i + 2), 16);
      }
      return result.buffer;
    },
  };
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
