import * as ImagePicker from 'expo-image-picker';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { supabase } from '../supabase/client';

type Source = 'gallery' | 'camera';

async function requestAndPick(source: Source): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra dans les réglages.');
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès aux photos dans les réglages.');
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return null;
    return result.assets[0].uri;
  }
}

export function showAvatarPicker(onPick: (uri: string) => void) {
  const options = ['Prendre une photo', 'Choisir dans la galerie', 'Annuler'];

  const handleChoice = async (index: number) => {
    let uri: string | null = null;
    if (index === 0) uri = await requestAndPick('camera');
    else if (index === 1) uri = await requestAndPick('gallery');
    if (uri) onPick(uri);
  };

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: 2, title: 'Photo de profil' },
      handleChoice
    );
  } else {
    Alert.alert('Photo de profil', undefined, [
      { text: 'Prendre une photo', onPress: () => requestAndPick('camera').then((u) => u && onPick(u)) },
      { text: 'Choisir dans la galerie', onPress: () => requestAndPick('gallery').then((u) => u && onPick(u)) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const response = await fetch(localUri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, blob, { contentType: `image/${ext}`, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Bust cache so the new image loads immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}
