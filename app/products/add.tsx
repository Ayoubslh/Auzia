import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { useAuthStore } from '../../store/authStore';
import { productRepository } from '../../repositories/ProductRepository';
import { uploadProductImage } from '../../utils/imagePicker';
import { getCityCoordinates } from '../../utils/cityCoordinates';
import countriesData from '../../mock/countries.json';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';

type PlaceType = 'shop' | 'restaurant';

const COUNTRIES = [
  'France', 'Belgique', 'Allemagne', 'Royaume-Uni', 'Espagne',
  'Pays-Bas', 'Suisse', 'Italie', 'Canada', 'États-Unis',
  'Australie', 'Émirats arabes unis', 'Qatar', 'Turquie',
  'Suède', 'Portugal', 'Norvège', 'Danemark', 'Finlande', 'Autriche', 'Grèce',
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'France':              ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg', 'Nantes', 'Lille', 'Nice', 'Montpellier', 'Rennes', 'Grenoble'],
  'Belgique':            ['Bruxelles', 'Liège', 'Anvers', 'Gand', 'Charleroi', 'Namur'],
  'Allemagne':           ['Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort', 'Stuttgart', 'Düsseldorf', 'Nuremberg'],
  'Royaume-Uni':         ['Londres', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Édimbourg'],
  'Espagne':             ['Barcelone', 'Madrid', 'Valence', 'Séville', 'Bilbao', 'Saragosse', 'Malaga'],
  'Pays-Bas':            ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven'],
  'Suisse':              ['Genève', 'Zurich', 'Berne', 'Lausanne', 'Bâle'],
  'Italie':              ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologne'],
  'Canada':              ['Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Calgary', 'Québec'],
  'États-Unis':          ['New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Boston', 'Washington', 'Miami', 'Seattle', 'Détroit'],
  'Australie':           ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adélaïde'],
  'Émirats arabes unis': ['Dubaï', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'Qatar':               ['Doha', 'Al-Wakrah', 'Al-Khor'],
  'Turquie':             ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
  'Suède':               ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
  'Portugal':            ['Lisbonne', 'Porto', 'Braga'],
  'Norvège':             ['Oslo', 'Bergen', 'Trondheim'],
  'Danemark':            ['Copenhague', 'Aarhus', 'Odense'],
  'Finlande':            ['Helsinki', 'Espoo', 'Tampere'],
  'Autriche':            ['Vienne', 'Graz', 'Linz', 'Salzbourg'],
  'Grèce':               ['Athènes', 'Thessalonique', 'Patras'],
};

export default function AddProductScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { currentUser } = useAuthStore();

  const [name, setName] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [type, setType] = useState<PlaceType>('shop');
  const [photo, setPhoto] = useState<string | null>(null);
  const [country, setCountry] = useState(currentUser?.countryOfResidence ?? '');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [rating, setRating] = useState(0);
  const [openPicker, setOpenPicker] = useState<'country' | 'city' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countryOptions = useMemo(() =>
    COUNTRIES.map((c) => ({ label: c, value: c })),
    [],
  );

  const cityOptions = useMemo(() => {
    const cities = CITIES_BY_COUNTRY[country] ?? [];
    return cities.map((c) => ({ label: c, value: c }));
  }, [country]);

  const canPublish = name.trim().length > 0 && placeName.trim().length > 0 && city.length > 0;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handlePublish = async () => {
    if (!currentUser || !canPublish || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const flag = countriesData.find((c) => c.country === country)?.flag ?? '';
      const coords = getCityCoordinates(city);

      let imageUrl: string | undefined;
      if (photo) {
        try {
          imageUrl = await uploadProductImage(currentUser.id, photo);
        } catch {
          // Image upload failed — create the product without a photo rather than blocking
        }
      }

      await productRepository.addProduct({
        kind: 'store',
        title: name,
        description: placeName,
        category: type === 'restaurant' ? 'Restaurant' : 'Boutique',
        tags: [],
        imageUrl,
        city,
        country,
        countryFlag: flag,
        cities: [],
        latitude: coords?.latitude ?? 0,
        longitude: coords?.longitude ?? 0,
        address: address.trim() || undefined,
        website: mapsLink.trim() || undefined,
        rating: rating > 0 ? rating : undefined,
        reviewCount: 0,
        addedBy: currentUser.id,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Erreur', e?.message ?? 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('produits.add_title')}</Text>
        <TouchableOpacity
          onPress={handlePublish}
          style={[styles.publishBtn, (!canPublish || isSubmitting) && styles.publishBtnDisabled]}
          disabled={!canPublish || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={[styles.publishText, !canPublish && styles.publishTextDisabled]}>
              {t('produits.add_publish')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <TextInput
            style={styles.nameInput}
            placeholder={t('produits.add_name_placeholder')}
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
            autoFocus
            returnKeyType="next"
          />

          {/* Type selector */}
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeCard, type === 'shop' && styles.typeCardActive]}
              onPress={() => setType('shop')}
              activeOpacity={0.75}
            >
              <View style={[styles.typeIconWrap, type === 'shop' && styles.typeIconWrapActive]}>
                <Ionicons name="storefront-outline" size={28} color={type === 'shop' ? Colors.primary : Colors.textSecondary} />
              </View>
              <Text style={[styles.typeLabel, type === 'shop' && styles.typeLabelActive]}>
                {t('produits.add_type_shop')}
              </Text>
              {type === 'shop' && <View style={styles.typeCheck}><Ionicons name="checkmark-circle" size={18} color={Colors.primary} /></View>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeCard, type === 'restaurant' && styles.typeCardActive]}
              onPress={() => setType('restaurant')}
              activeOpacity={0.75}
            >
              <View style={[styles.typeIconWrap, type === 'restaurant' && styles.typeIconWrapActive]}>
                <Ionicons name="restaurant-outline" size={28} color={type === 'restaurant' ? Colors.primary : Colors.textSecondary} />
              </View>
              <Text style={[styles.typeLabel, type === 'restaurant' && styles.typeLabelActive]}>
                {t('produits.add_type_restaurant')}
              </Text>
              {type === 'restaurant' && <View style={styles.typeCheck}><Ionicons name="checkmark-circle" size={18} color={Colors.primary} /></View>}
            </TouchableOpacity>
          </View>

          {/* Shop / restaurant name */}
          <View style={styles.placeNameCard}>
            <View style={styles.placeNameIcon}>
              <Ionicons
                name={type === 'restaurant' ? 'restaurant-outline' : 'storefront-outline'}
                size={17}
                color={Colors.primary}
              />
            </View>
            <View style={styles.placeNameContent}>
              <Text style={styles.placeNameLabel}>
                {type === 'restaurant' ? t('produits.add_place_name_restaurant') : t('produits.add_place_name_shop')}
              </Text>
              <TextInput
                style={styles.placeNameInput}
                placeholder={t('produits.add_place_name_placeholder')}
                placeholderTextColor={Colors.textTertiary}
                value={placeName}
                onChangeText={setPlaceName}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingCard}>
            <Text style={styles.ratingLabel}>Note</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={star <= rating ? '#F59E0B' : Colors.textTertiary}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <TouchableOpacity onPress={() => setRating(0)}>
                <Text style={styles.ratingClear}>Effacer</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo upload */}
          <TouchableOpacity style={styles.photoArea} onPress={pickImage} activeOpacity={0.8}>
            {photo ? (
              <>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.photoChange} onPress={pickImage} activeOpacity={0.8}>
                  <Ionicons name="camera-outline" size={16} color={Colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.photoPlaceholder}>
                <View style={styles.photoIconCircle}>
                  <Ionicons name="camera-outline" size={28} color={Colors.textSecondary} />
                </View>
                <Text style={styles.photoLabel}>{t('produits.add_photo')}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Location section */}
          <View style={styles.locationCard}>
            {/* Country row */}
            <TouchableOpacity style={styles.locationRow} onPress={() => setOpenPicker('country')} activeOpacity={0.7}>
              <View style={styles.locationIcon}>
                <Ionicons name="earth-outline" size={17} color={Colors.primary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>{t('onboarding.country_label')}</Text>
                <Text style={[styles.locationValue, !country && styles.locationPlaceholder]}>
                  {country || t('onboarding.country_placeholder')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <View style={styles.locationDivider} />

            {/* City row */}
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => country && setOpenPicker('city')}
              activeOpacity={country ? 0.7 : 1}
            >
              <View style={styles.locationIcon}>
                <Ionicons name="business-outline" size={17} color={country ? Colors.primary : Colors.textTertiary} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={[styles.locationLabel, !country && { color: Colors.textTertiary }]}>
                  {t('onboarding.city_label')}
                </Text>
                <Text style={[styles.locationValue, !city && styles.locationPlaceholder]}>
                  {city || (country ? t('produits.add_city_placeholder') : t('onboarding.choose_country_first'))}
                </Text>
              </View>
              {country && <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />}
            </TouchableOpacity>

            <View style={styles.locationDivider} />

            {/* Address row */}
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Ionicons name="location-outline" size={17} color={Colors.primary} />
              </View>
              <TextInput
                style={styles.locationTextInput}
                placeholder={t('produits.add_address_placeholder')}
                placeholderTextColor={Colors.textTertiary}
                value={address}
                onChangeText={setAddress}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Google Maps link */}
          <View style={styles.mapsCard}>
            <View style={styles.mapsIcon}>
              <Ionicons name="map-outline" size={17} color="#EA4335" />
            </View>
            <View style={styles.mapsContent}>
              <Text style={styles.mapsLabel}>{t('produits.add_maps_label')}</Text>
              <TextInput
                style={styles.mapsInput}
                placeholder={t('produits.add_maps_placeholder')}
                placeholderTextColor={Colors.textTertiary}
                value={mapsLink}
                onChangeText={setMapsLink}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FilterSheet
        visible={openPicker === 'country'}
        title={t('produits.sheet_country')}
        options={countryOptions}
        value={country}
        onSelect={(v) => { setCountry(v); setCity(''); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />
      <FilterSheet
        visible={openPicker === 'city'}
        title={t('produits.sheet_city')}
        options={cityOptions}
        value={city}
        onSelect={(v) => { setCity(v); setOpenPicker(null); }}
        onClose={() => setOpenPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  publishBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  publishBtnDisabled: { backgroundColor: Colors.border },
  publishText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },
  publishTextDisabled: { color: Colors.textTertiary },

  scroll: { padding: Spacing.base, gap: Spacing.lg },

  nameInput: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: 0,
  },

  typeRow: { flexDirection: 'row', gap: Spacing.md },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    position: 'relative',
    ...Shadow.sm,
  },
  typeCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIconWrapActive: { backgroundColor: Colors.white },
  typeLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary, textAlign: 'center' },
  typeLabelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  typeCheck: { position: 'absolute', top: Spacing.sm, right: Spacing.sm },

  placeNameCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  placeNameIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  placeNameContent: { flex: 1, gap: 2 },
  placeNameLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    letterSpacing: 0.4,
  },
  placeNameInput: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },

  photoArea: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
  },
  photoIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  photoLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  photoChange: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  locationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: { flex: 1, gap: 2 },
  locationLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, letterSpacing: 0.4 },
  locationValue: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  locationPlaceholder: { color: Colors.textTertiary, fontWeight: FontWeight.regular },
  locationTextInput: {
    flex: 1,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },
  locationDivider: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base + 34 + Spacing.md },

  mapsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  mapsIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  mapsContent: { flex: 1, gap: 4 },
  mapsLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, letterSpacing: 0.4 },
  mapsInput: {
    fontSize: FontSize.base,
    color: Colors.textPrimary,
    paddingVertical: Spacing.xs,
  },

  ratingCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  ratingLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.4,
    alignSelf: 'flex-start',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingClear: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textDecorationLine: 'underline',
  },
});
