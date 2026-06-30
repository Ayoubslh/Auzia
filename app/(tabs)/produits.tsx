import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/AppHeader';
import { ExpandableMap } from '../../components/shared/ExpandableMap';
import { FilterChip } from '../../components/ui/FilterChip';
import { FilterSheet } from '../../components/ui/FilterSheet';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { productRepository } from '../../repositories/ProductRepository';
import { useMessageStore } from '../../store/messageStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { Product, ProductItem, Dish, ProductFilter } from '../../types';

// ── Country → centre map (reused from diaspora) ───────────────────────────────

const COUNTRY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'France':              { lat: 46.23, lng: 2.21,   zoom: 5 },
  'Belgique':            { lat: 50.50, lng: 4.47,   zoom: 7 },
  'Allemagne':           { lat: 51.17, lng: 10.45,  zoom: 5 },
  'Royaume-Uni':         { lat: 54.00, lng: -2.00,  zoom: 5 },
  'Espagne':             { lat: 40.42, lng: -3.70,  zoom: 5 },
  'Pays-Bas':            { lat: 52.37, lng: 5.29,   zoom: 7 },
  'Suisse':              { lat: 46.82, lng: 8.23,   zoom: 7 },
  'Italie':              { lat: 41.87, lng: 12.57,  zoom: 5 },
  'Canada':              { lat: 56.13, lng: -106.35,zoom: 3 },
  'États-Unis':          { lat: 37.09, lng: -95.71, zoom: 3 },
  'Australie':           { lat: -25.27,lng: 133.78, zoom: 3 },
};

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'France':      ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Lille', 'Nice'],
  'Belgique':    ['Bruxelles', 'Liège', 'Anvers', 'Gand'],
  'Allemagne':   ['Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort'],
  'Royaume-Uni': ['Londres', 'Birmingham', 'Manchester', 'Glasgow'],
  'Espagne':     ['Barcelone', 'Madrid', 'Valence', 'Séville'],
  'Pays-Bas':    ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht'],
  'Suisse':      ['Genève', 'Zurich', 'Berne', 'Lausanne'],
  'Canada':      ['Montréal', 'Toronto', 'Vancouver', 'Ottawa'],
  'États-Unis':  ['New York', 'Los Angeles', 'Chicago', 'San Francisco'],
  'Australie':   ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
};

type CategoryFilter = 'product' | 'store' | 'restaurant';

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; labelKey: string; emoji?: string }> = [
  { id: 'product',    labelKey: 'produits.filter_products',    emoji: '🛍️' },
  { id: 'store',      labelKey: 'produits.filter_stores',      emoji: '🏪' },
  { id: 'restaurant', labelKey: 'produits.filter_restaurants', emoji: '🍽️' },
];

export default function ProduitsScreen() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { conversations } = useMessageStore();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({});
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('product');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFilter, setOpenFilter] = useState<'country' | 'city' | null>(null);
  const [infoModal, setInfoModal] = useState<Product | null>(null);

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  useEffect(() => {
    productRepository.getProducts().then(setProducts);
  }, []);

  // ── Filter options ─────────────────────────────────────────────────────────

  const allCountries = useMemo(() => {
    const countries = [...new Set(products.map((p) => p.country))].sort();
    return [
      { label: t('diaspora.filter_all_countries'), value: '' },
      ...countries.map((c) => ({ label: c, value: c })),
    ];
  }, [products, t]);

  const cityOptions = useMemo(() => {
    const cities = filter.country
      ? (CITIES_BY_COUNTRY[filter.country] ?? [...new Set(products.filter((p) => p.country === filter.country).map((p) => p.city))].sort())
      : [];
    return [
      { label: t('diaspora.filter_all_cities'), value: '' },
      ...cities.map((c) => ({ label: c, value: c })),
    ];
  }, [filter.country, products, t]);

  const handleSelectCountry = (value: string) => {
    const found = allCountries.find((c) => c.value === value);
    setFilter({ country: value || undefined, countryFlag: found?.label.startsWith('🇫') ? '' : undefined, city: undefined });
  };

  const handleSelectCity = (value: string) => {
    setFilter((f) => ({ ...f, city: value || undefined }));
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = products;

    if (filter.country) result = result.filter((p) => p.country === filter.country || (p.cities ?? []).includes(filter.country!));
    if (filter.city) result = result.filter((p) => p.city === filter.city || (p.cities ?? []).includes(filter.city!));

    if (categoryFilter === 'product') result = result.filter((p) => p.kind === 'brand');
    else if (categoryFilter === 'store') result = result.filter((p) => p.kind === 'store' && p.category !== 'Restaurant');
    else if (categoryFilter === 'restaurant') result = result.filter((p) => p.kind === 'store' && p.category === 'Restaurant');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.tags ?? []).some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    const userCity = currentUser?.cityOfResidence ?? '';
    result = [...result].sort((a, b) => {
      const aLocal = a.city === userCity || (a.cities ?? []).includes(userCity) ? 0 : 1;
      const bLocal = b.city === userCity || (b.cities ?? []).includes(userCity) ? 0 : 1;
      return aLocal - bLocal;
    });

    return result;
  }, [products, filter, categoryFilter, searchQuery, currentUser?.cityOfResidence]);

  // ── Map config ─────────────────────────────────────────────────────────────

  const mapCenter = filter.country
    ? COUNTRY_CENTERS[filter.country] ?? { lat: 46.23, lng: 2.21, zoom: 5 }
    : COUNTRY_CENTERS[currentUser?.countryOfResidence ?? ''] ?? { lat: 46.23, lng: 2.21, zoom: 5 };

  const mapMarkers = filtered
    .filter((p) => p.kind === 'store')
    .map((p) => ({ id: p.id, latitude: p.latitude, longitude: p.longitude, label: p.title }));

  const mapTitle = filter.country
    ? `${t('produits.map_title_all')} — ${filter.country}`
    : t('produits.map_title_all');

  const hasActiveFilter = !!(filter.country || filter.city);

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader user={currentUser} notificationCount={3} messageCount={totalUnread} />

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('produits.search_placeholder')}
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Country / City filters + Add button */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChips}
          style={styles.filterScroll}
        >
          <FilterChip
            label={filter.country ?? t('produits.filter_country')}
            active={!!filter.country}
            onPress={() => setOpenFilter('country')}
            showChevron
          />
          <FilterChip
            label={filter.city ?? t('produits.filter_city')}
            active={!!filter.city}
            onPress={() => setOpenFilter('city')}
            showChevron
          />
          {hasActiveFilter && (
            <FilterChip
              label={t('diaspora.reset_filter')}
              active={false}
              onPress={() => setFilter({})}
              showChevron={false}
            />
          )}
        </ScrollView>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/products/add' as any)}>
          <Ionicons name="add" size={16} color={Colors.white} />
          <Text style={styles.addBtnText}>{t('produits.add_btn')}</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <ExpandableMap
          markers={mapMarkers}
          onMarkerPress={(id) => {
            const product = filtered.find((p) => p.id === id);
            if (product) setInfoModal(product);
          }}
          centerLat={mapCenter.lat}
          centerLng={mapCenter.lng}
          zoom={mapCenter.zoom}
          collapsedHeight={180}
          title={mapTitle}
        />
      </View>

      {/* Category filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={styles.categoryScroll}
      >
        {CATEGORY_FILTERS.map((f) => (
          <FilterChip
            key={f.id}
            label={t(f.labelKey)}
            emoji={f.emoji}
            active={categoryFilter === f.id}
            onPress={() => setCategoryFilter(f.id)}
            showChevron={false}
          />
        ))}
      </ScrollView>

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="bag-outline" size={32} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>{t('produits.empty_title')}</Text>
          <Text style={styles.emptyDesc}>{t('produits.empty_desc')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.kind === 'brand'
              ? <BrandCard product={item} onPress={() => setInfoModal(item)} />
              : <StoreCard product={item} onPress={() => setInfoModal(item)} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Filter sheets */}
      <FilterSheet
        visible={openFilter === 'country'}
        title={t('produits.sheet_country')}
        options={allCountries}
        value={filter.country ?? ''}
        onSelect={handleSelectCountry}
        onClose={() => setOpenFilter(null)}
      />
      <FilterSheet
        visible={openFilter === 'city'}
        title={t('produits.sheet_city')}
        options={cityOptions}
        value={filter.city ?? ''}
        onSelect={handleSelectCity}
        onClose={() => setOpenFilter(null)}
      />

      {/* Info modal */}
      <InfoModal
        product={infoModal}
        allProducts={products}
        onClose={() => setInfoModal(null)}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const StoreCard: React.FC<{ product: Product; onPress: () => void }> = ({ product, onPress }) => {
  const { t } = useTranslation();
  const isRestaurant = product.category === 'Restaurant';
  return (
    <TouchableOpacity style={cardStyles.storeCard} onPress={onPress} activeOpacity={0.75}>
      <View style={cardStyles.storeIconCircle}>
        <Ionicons
          name={isRestaurant ? 'restaurant-outline' : 'storefront-outline'}
          size={20}
          color={Colors.primary}
        />
      </View>
      <View style={cardStyles.info}>
        <View style={cardStyles.titleRow}>
          <Text style={cardStyles.title} numberOfLines={1}>{product.title}</Text>
          <Text style={cardStyles.flag}>{product.countryFlag}</Text>
        </View>
        <Text style={cardStyles.meta}>{product.city} · {product.category}</Text>
        {product.rating !== undefined && (
          <View style={cardStyles.ratingRow}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={cardStyles.rating}>{product.rating}</Text>
            <Text style={cardStyles.reviews}>({product.reviewCount} {t('produits.reviews')})</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </TouchableOpacity>
  );
};

const BrandCard: React.FC<{ product: Product; onPress: () => void }> = ({ product, onPress }) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={cardStyles.brandCard} onPress={onPress} activeOpacity={0.75}>
      <View style={cardStyles.brandTop}>
        <View style={cardStyles.brandEmojiWrap}>
          <Text style={cardStyles.brandEmoji}>{product.emoji ?? '🇩🇿'}</Text>
        </View>
        <View style={cardStyles.info}>
          <Text style={cardStyles.brandTitle} numberOfLines={1}>{product.title}</Text>
          {product.rating !== undefined && (
            <View style={cardStyles.ratingRow}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={cardStyles.rating}>{product.rating}</Text>
              <Text style={cardStyles.reviews}>({product.reviewCount} {t('produits.reports')})</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={cardStyles.brandDesc} numberOfLines={2}>{product.description}</Text>
      {product.tags && product.tags.length > 0 && (
        <View style={cardStyles.tagsRow}>
          {product.tags.map((tag) => (
            <View key={tag} style={cardStyles.tag}>
              <Text style={cardStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
      {product.cities && product.cities.length > 0 && (
        <View style={cardStyles.citiesRow}>
          <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
          <Text style={cardStyles.citiesText} numberOfLines={1}>{product.cities.join(' · ')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const InfoModal: React.FC<{
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
}> = ({ product, allProducts, onClose }) => {
  const { t } = useTranslation();
  if (!product) return null;

  const isRestaurant = product.kind === 'store' && product.category === 'Restaurant';
  const isStore     = product.kind === 'store' && product.category !== 'Restaurant';
  const isBrand     = product.kind === 'brand';

  let modalTitle = '';
  let listData: Array<{ id: string; name: string; emoji: string; description?: string }> = [];

  if (isBrand) {
    modalTitle = t('produits.modal_sold_at');
    listData = (product.availableAt ?? [])
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map((s) => ({
        id: s!.id,
        name: s!.title,
        emoji: s!.category === 'Restaurant' ? '🍽️' : '🏪',
        description: `${s!.city} · ${s!.country}`,
      }));
  } else if (isStore) {
    modalTitle = t('produits.modal_products');
    listData = (product.items ?? []).map((i: ProductItem) => ({ id: i.id, name: i.name, emoji: i.emoji, description: i.description }));
  } else if (isRestaurant) {
    modalTitle = t('produits.modal_dishes');
    listData = (product.dishes ?? []).map((d: Dish) => ({ id: d.id, name: d.name, emoji: d.emoji, description: d.description }));
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View style={modalStyles.backdrop}>
        <TouchableOpacity style={modalStyles.backdropTouch} onPress={onClose} activeOpacity={1} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          {/* Header */}
          <View style={modalStyles.header}>
            <View style={modalStyles.headerIcon}>
              {isBrand
                ? <Text style={{ fontSize: 22 }}>{product.emoji ?? '🇩🇿'}</Text>
                : <Ionicons name={isRestaurant ? 'restaurant-outline' : 'storefront-outline'} size={20} color={Colors.primary} />
              }
            </View>
            <View style={modalStyles.headerInfo}>
              <Text style={modalStyles.headerTitle} numberOfLines={1}>{product.title}</Text>
              <Text style={modalStyles.headerMeta}>{product.city} · {product.country}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Rating row */}
          {product.rating !== undefined && (
            <View style={modalStyles.ratingRow}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={modalStyles.ratingText}>{product.rating}</Text>
              <Text style={modalStyles.ratingCount}>({product.reviewCount})</Text>
            </View>
          )}

          {/* Section title */}
          <Text style={modalStyles.sectionTitle}>{modalTitle}</Text>

          {/* Items list */}
          {listData.length === 0 ? (
            <Text style={modalStyles.noData}>{t('produits.modal_no_data')}</Text>
          ) : (
            <FlatList
              data={listData}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={modalStyles.itemRow}>
                  <View style={modalStyles.itemEmoji}>
                    <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                  </View>
                  <View style={modalStyles.itemInfo}>
                    <Text style={modalStyles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={modalStyles.itemDesc} numberOfLines={1}>{item.description}</Text>
                    )}
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
              style={modalStyles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  searchRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    height: 42,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.base,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
    
  },
  filterScroll: { flex: 1 },
  filterChips: {
    paddingLeft: Spacing.base,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.white },

  mapContainer: {
    height: 180,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  categoryScroll: { flexGrow: 0 },
  categoryRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
    flexDirection: 'row',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textTertiary },
  listContent: { paddingBottom: Spacing.xxl },
});

const cardStyles = StyleSheet.create({
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  storeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCard: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xxl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...Shadow.sm,
  },
  brandTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  brandEmojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandEmoji: { fontSize: 22 },
  brandTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 },
  brandDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tagText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  citiesRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  citiesText: { fontSize: FontSize.xs, color: Colors.textTertiary, flex: 1 },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  title: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary, flex: 1 },
  flag: { fontSize: 14 },
  meta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  rating: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  reviews: { fontSize: FontSize.xs, color: Colors.textTertiary },
});

const modalStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '65%',
    paddingBottom: Spacing.xl,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 2 },
  headerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  ratingText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textTertiary },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  noData: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.base,
  },
  list: { flexGrow: 0 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  itemEmoji: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  itemDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  separator: { height: 1, backgroundColor: Colors.borderLight, marginLeft: Spacing.base + 40 + Spacing.md },
});
