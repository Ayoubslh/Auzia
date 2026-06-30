import { create } from 'zustand';
import { Alert, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n, { LANGUAGE_KEY, type Language } from '../utils/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'fr',
  setLanguage: async (lang: Language) => {
    const wasRTL = I18nManager.isRTL;
    const willBeRTL = lang === 'ar';
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
    set({ language: lang });
    if (wasRTL !== willBeRTL) {
      I18nManager.forceRTL(willBeRTL);
      Alert.alert(i18n.t('language.restart_needed'), '', [{ text: 'OK' }]);
    }
  },
}));
