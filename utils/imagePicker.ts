import * as ImagePicker from 'expo-image-picker';
import { Alert, ActionSheetIOS, Platform } from 'react-native';
import { supabase } from '../supabase/client';

type Source = 'gallery' | 'camera';

async function requestAndPick(source: Source): Promise<string | null> {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', "Autorisez l'accès à la caméra dans les réglages.");
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
      Alert.alert('Permission refusée', "Autorisez l'accès aux photos dans les réglages.");
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

async function uploadToStorage(bucket: string, path: string, localUri: string): Promise<string> {
  const ext = path.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;

  // arrayBuffer() is more reliable than blob() on React Native
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, { contentType: mimeType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function uploadAvatar(userId: string, localUri: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  return uploadToStorage('avatars', `${userId}/avatar.${ext}`, localUri);
}

export async function uploadProductImage(userId: string, localUri: string): Promise<string> {
  const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
  return uploadToStorage('product-images', `${userId}/${Date.now()}.${ext}`, localUri);
}
