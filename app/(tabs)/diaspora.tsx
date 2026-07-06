import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Animated,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppHeader } from '../../components/shared/AppHeader';
import { ExpandableMap } from '../../components/shared/ExpandableMap';
import { UserCard } from '../../components/shared/UserCard';
import { ConnectModal } from '../../components/shared/ConnectModal';
import { Avatar } from '../../components/ui/Avatar';
import { FilterChip } from '../../components/ui/FilterChip';
import { FilterSheet, type FilterOption } from '../../components/ui/FilterSheet';
import { getCityCoordinates } from '../../utils/cityCoordinates';
import { getDisplayName } from '../../utils/displayName';
import { useAuthStore } from '../../store/authStore';
import { useDiasporaStore } from '../../store/diasporaStore';
import { useMessageStore } from '../../store/messageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { useConnectionStore } from '../../store/connectionStore';
import { useToastStore } from '../../store/toastStore';
import { MOCK_USERS } from '../../mock';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../theme';
import type { User } from '../../types';

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
  'Émirats arabes unis': { lat: 23.42, lng: 53.85,  zoom: 7 },
  'Qatar':               { lat: 25.35, lng: 51.18,  zoom: 8 },
  'Turquie':             { lat: 38.96, lng: 35.24,  zoom: 5 },
  'Suède':               { lat: 60.13, lng: 18.64,  zoom: 5 },
  'Portugal':            { lat: 39.40, lng: -8.22,  zoom: 6 },
  'Norvège':             { lat: 60.47, lng: 8.47,   zoom: 5 },
  'Danemark':            { lat: 56.26, lng: 9.50,   zoom: 6 },
  'Finlande':            { lat: 61.92, lng: 25.75,  zoom: 5 },
  'Autriche':            { lat: 47.52, lng: 14.55,  zoom: 6 },
  'Grèce':               { lat: 39.07, lng: 21.82,  zoom: 6 },
};

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'France': [
    'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Strasbourg',
    'Nantes', 'Lille', 'Nice', 'Montpellier', 'Rennes', 'Grenoble',
    'Dijon', 'Metz', 'Le Havre', 'Saint-Étienne', 'Aix-en-Provence',
    'Toulon', 'Clermont-Ferrand', 'Reims', 'Rouen', 'Valenciennes',
  ],
  'Belgique': ['Bruxelles', 'Liège', 'Anvers', 'Gand', 'Charleroi', 'Namur'],
  'Allemagne': [
    'Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort', 'Stuttgart',
    'Düsseldorf', 'Dortmund', 'Essen', 'Nuremberg',
  ],
  'Royaume-Uni': ['Londres', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Édimbourg'],
  'Espagne': ['Barcelone', 'Madrid', 'Valence', 'Séville', 'Bilbao', 'Saragosse', 'Malaga'],
  'Pays-Bas': ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht', 'Eindhoven', 'Groningue'],
  'Suisse': ['Genève', 'Zurich', 'Berne', 'Lausanne', 'Bâle', 'Lucerne'],
  'Italie': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologne', 'Gênes'],
  'Canada': ['Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Calgary', 'Québec', 'Edmonton'],
  'États-Unis': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Détroit', 'San Francisco', 'Boston', 'Washington', 'Miami', 'Seattle'],
  'Australie': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adélaïde', 'Canberra'],
  'Émirats arabes unis': ['Dubaï', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'Qatar': ['Doha', 'Al-Wakrah', 'Al-Khor'],
  'Turquie': ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
  'Suède': ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala'],
  'Portugal': ['Lisbonne', 'Porto', 'Braga', 'Setúbal'],
  'Norvège': ['Oslo', 'Bergen', 'Trondheim', 'Stavanger'],
  'Danemark': ['Copenhague', 'Aarhus', 'Odense'],
  'Finlande': ['Helsinki', 'Espoo', 'Tampere'],
  'Autriche': ['Vienne', 'Graz', 'Linz', 'Salzbourg'],
  'Grèce': ['Athènes', 'Thessalonique', 'Patras'],
};

export default function DiasporaScreen() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const { filteredUsers, fetchUsers, filter, setFilter, resetFilter } = useDiasporaStore();
  const { fetchConversations, totalUnreadMessages } = useMessageStore();
  const { unreadCount: unreadNotifications } = useNotificationStore();
  const { sentRequests, fetchSentRequests, sendRequest: sendConnectionRequest, subscribeToUpdates, unsubscribeFromUpdates } = useConnectionStore();
  const showToast = useToastStore((s) => s.show);
  const { t } = useTranslation();

  const [connectTarget, setConnectTarget] = useState<User | null>(null);
  const [openFilter, setOpenFilter] = useState<'country' | 'city' | 'domain' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [markerUser, setMarkerUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pendingIds = useMemo(
    () => new Set(sentRequests.filter((r) => r.status === 'pending').map((r) => r.receiverId)),
    [sentRequests]
  );

  const acceptedIds = useMemo(
    () => new Set(sentRequests.filter((r) => r.status === 'accepted').map((r) => r.receiverId)),
    [sentRequests]
  );

  const cardAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = useCallback(async () => {
    if (!currentUser) return;
    setRefreshing(true);
    await Promise.all([
      fetchUsers(),
      fetchSentRequests(currentUser.id),
      fetchConversations(),
    ]);
    setRefreshing(false);
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
    fetchConversations();
    if (currentUser) {
      fetchSentRequests(currentUser.id);
      subscribeToUpdates(currentUser.id);
    }
    return () => { unsubscribeFromUpdates(); };
  }, []);

  // ── Marker card ────────────────────────────────────────────────────────────

  const showMarkerCard = (user: User) => {
    setMarkerUser(user);
    cardAnim.setValue(0);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 70,
      friction: 10,
    }).start();
  };

  const hideMarkerCard = () => {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => setMarkerUser(null));
  };

  // ── Filter options ─────────────────────────────────────────────────────────

  const countryOptions: FilterOption[] = useMemo(() => [
    { label: t('diaspora.filter_all_countries'), value: '', icon: '🌍' },
    ...Array.from(
      new Map(
        MOCK_USERS.map((u) => [
          u.countryOfResidence,
          { label: u.countryOfResidence, value: u.countryOfResidence, icon: u.countryOfResidenceFlag },
        ])
      ).values()
    ).sort((a, b) => a.label.localeCompare(b.label)),
  ], []);

  const cityOptions: FilterOption[] = useMemo(() => {
    let cities: string[];
    if (filter.country && CITIES_BY_COUNTRY[filter.country]) {
      cities = CITIES_BY_COUNTRY[filter.country];
    } else if (filter.country) {
      // Country not in predefined list — fall back to users in that country
      cities = Array.from(new Set(
        MOCK_USERS.filter((u) => u.countryOfResidence === filter.country).map((u) => u.cityOfResidence)
      )).sort();
    } else {
      // No country selected — all cities from all predefined lists
      cities = Array.from(new Set(Object.values(CITIES_BY_COUNTRY).flat())).sort();
    }
    return [
      { label: t('diaspora.filter_all_cities'), value: '', icon: '📍' },
      ...cities.map((city) => ({ label: city, value: city })),
    ];
  }, [filter.country]);

  const domainOptions: FilterOption[] = useMemo(() => [
    { label: t('diaspora.filter_all_domains'), value: '', icon: '💼' },
    ...Array.from(new Set(MOCK_USERS.map((u) => u.workField)))
      .sort()
      .map((d) => ({ label: d, value: d })),
  ], []);

  // ── Search ─────────────────────────────────────────────────────────────────

  const displayedUsers = useMemo(() => {
    const withoutSelf = filteredUsers.filter((u) => u.id !== currentUser?.id);
    if (!searchQuery.trim()) return withoutSelf;
    const q = searchQuery.toLowerCase();
    return withoutSelf.filter(
      (u) =>
        u.nickname.toLowerCase().includes(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
        u.cityOfResidence.toLowerCase().includes(q) ||
        u.workField.toLowerCase().includes(q)
    );
  }, [filteredUsers, searchQuery, currentUser?.id]);

  // ── Filter handlers ────────────────────────────────────────────────────────

  const handleSelectCountry = (value: string) => {
    if (!value) {
      setFilter({ ...filter, country: undefined, countryFlag: undefined, city: undefined });
    } else {
      const flag = MOCK_USERS.find((u) => u.countryOfResidence === value)?.countryOfResidenceFlag;
      setFilter({ country: value, countryFlag: flag, city: undefined });
    }
  };

  const handleSelectCity = (value: string) => {
    setFilter({ ...filter, city: value || undefined });
  };

  const handleSelectDomain = (value: string) => {
    setFilter({ ...filter, domain: value || undefined });
  };

  const hasActiveFilter = !!(filter.country || filter.city || filter.domain);

  const mapTitle = filter.country
    ? t('diaspora.map_title_country', { country: filter.country })
    : t('diaspora.map_title_world');

  // ── Connect ────────────────────────────────────────────────────────────────

  const handleSendConnectRequest = async (note: string) => {
    const target = connectTarget;
    setConnectTarget(null);
    if (currentUser && target) {
      await sendConnectionRequest(currentUser.id, target.id, note);
      showToast(t('user.request_sent', { name: target.nickname || target.firstName }));
    }
  };

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <AppHeader user={currentUser} notificationCount={unreadNotifications} messageCount={totalUnreadMessages} />

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('diaspora.search_placeholder')}
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

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        <FilterChip
          label={filter.country ?? t('diaspora.filter_country')}
          emoji={filter.countryFlag}
          active={!!filter.country}
          onPress={() => setOpenFilter('country')}
          showChevron
        />
        <FilterChip
          label={filter.city ?? t('diaspora.filter_city')}
          active={!!filter.city}
          onPress={() => setOpenFilter('city')}
          showChevron
        />
        <FilterChip
          label={filter.domain ?? t('diaspora.filter_domain')}
          active={!!filter.domain}
          onPress={() => setOpenFilter('domain')}
          showChevron
        />
        {hasActiveFilter && (
          <FilterChip
            label={t('diaspora.reset_filter')}
            active={false}
            onPress={() => { resetFilter(); setSearchQuery(''); }}
            showChevron={false}
          />
        )}
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        <ExpandableMap
          markers={displayedUsers
            .filter((u) => u.showOnMap)
            .map((u) => {
              const coords = getCityCoordinates(u.cityOfResidence);
              if (!coords) return null;
              return { id: u.id, latitude: coords.latitude, longitude: coords.longitude, label: getDisplayName(u) };
            })
            .filter((m): m is NonNullable<typeof m> => m !== null)}
          onMarkerPress={(id) => {
            const user = displayedUsers.find((u) => u.id === id);
            if (user) showMarkerCard(user);
          }}
          centerLat={
            filter.country
              ? (COUNTRY_CENTERS[filter.country]?.lat ?? displayedUsers[0]?.latitude ?? 46.23)
              : (COUNTRY_CENTERS[currentUser.countryOfResidence]?.lat ?? 46.23)
          }
          centerLng={
            filter.country
              ? (COUNTRY_CENTERS[filter.country]?.lng ?? displayedUsers[0]?.longitude ?? 2.21)
              : (COUNTRY_CENTERS[currentUser.countryOfResidence]?.lng ?? 2.21)
          }
          zoom={
            filter.country
              ? (COUNTRY_CENTERS[filter.country]?.zoom ?? 6)
              : (COUNTRY_CENTERS[currentUser.countryOfResidence]?.zoom ?? 5)
          }
          collapsedHeight={180}
          title={mapTitle}
        />
        {markerUser && (
          <Animated.View
            style={[
              styles.markerCard,
              {
                opacity: cardAnim,
                transform: [{
                  translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                }],
              },
            ]}
          >
            <View style={styles.markerCardTop}>
              <Avatar
                initials={markerUser.avatarInitials}
                color={markerUser.avatarColor}
                size={40}
              />
              <View style={styles.markerCardInfo}>
                <Text style={styles.markerCardName} numberOfLines={1}>
                  {getDisplayName(markerUser)}{' '}
                  <Text style={styles.markerCardFlag}>{markerUser.countryOfResidenceFlag}</Text>
                </Text>
                <Text style={styles.markerCardMeta} numberOfLines={1}>
                  {markerUser.cityOfResidence} · {markerUser.workField}
                </Text>
              </View>
              <TouchableOpacity onPress={hideMarkerCard} style={styles.markerCardClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={15} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.markerCardActions}>
              <TouchableOpacity
                style={styles.markerCardBtnOutline}
                onPress={() => { hideMarkerCard(); router.push(`/user/${markerUser.id}` as any); }}
                activeOpacity={0.8}
              >
                <Text style={styles.markerCardBtnOutlineText}>{t('user_card.see_profile')}</Text>
              </TouchableOpacity>
              {acceptedIds.has(markerUser.id) ? (
                <TouchableOpacity
                  style={styles.markerCardBtnPrimary}
                  onPress={() => {
                    hideMarkerCard();
                    const convId = [currentUser.id, markerUser.id].sort().join('_');
                    router.push(`/messages/${convId}` as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chatbubble-outline" size={13} color={Colors.white} />
                  <Text style={styles.markerCardBtnPrimaryText}>Message</Text>
                </TouchableOpacity>
              ) : pendingIds.has(markerUser.id) ? (
                <View style={[styles.markerCardBtnOutline, styles.markerCardBtnPending]}>
                  <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                  <Text style={styles.markerCardBtnPendingText}>{t('user_card.pending')}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.markerCardBtnPrimary}
                  onPress={() => { hideMarkerCard(); setConnectTarget(markerUser); }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add-outline" size={13} color={Colors.white} />
                  <Text style={styles.markerCardBtnPrimaryText}>{t('user_card.connect')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Members section */}
      <View style={styles.membersHeader}>
        <Text style={styles.membersTitle}>
          {t('diaspora.members_title')} <Text style={styles.membersCount}>{displayedUsers.length}</Text>
        </Text>
        <View style={styles.membersActions}>
          {hasActiveFilter && (
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => { resetFilter(); setSearchQuery(''); }}
            >
              <Text style={styles.resetText}>× {t('diaspora.reset_filter')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={17} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={displayedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            onConnect={() => setConnectTarget(item)}
            onMessage={() => {
              const convId = [currentUser.id, item.id].sort().join('_');
              router.push(`/messages/${convId}` as any);
            }}
            isPending={pendingIds.has(item.id)}
            isConnected={acceptedIds.has(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>{t('diaspora.empty_title')}</Text>
            <Text style={styles.emptyDesc}>{t('diaspora.empty_desc')}</Text>
          </View>
        }
      />

      {/* Filter sheets */}
      <FilterSheet
        visible={openFilter === 'country'}
        title={t('diaspora.sheet_country')}
        options={countryOptions}
        value={filter.country ?? ''}
        onSelect={handleSelectCountry}
        onClose={() => setOpenFilter(null)}
      />
      <FilterSheet
        visible={openFilter === 'city'}
        title={t('diaspora.sheet_city')}
        options={cityOptions}
        value={filter.city ?? ''}
        onSelect={handleSelectCity}
        onClose={() => setOpenFilter(null)}
        searchable={cityOptions.length > 6}
      />
      <FilterSheet
        visible={openFilter === 'domain'}
        title={t('diaspora.sheet_domain')}
        options={domainOptions}
        value={filter.domain ?? ''}
        onSelect={handleSelectDomain}
        onClose={() => setOpenFilter(null)}
      />

      <ConnectModal
        visible={connectTarget !== null}
        userName={connectTarget ? getDisplayName(connectTarget) : ''}
        avatarInitials={connectTarget?.avatarInitials ?? ''}
        avatarColor={connectTarget?.avatarColor ?? Colors.primary}
        onClose={() => setConnectTarget(null)}
        onSend={handleSendConnectRequest}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  searchRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
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

  filterScroll: { flexGrow: 0, overflow: 'visible' },
  filterRow: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.base,
  },

  mapContainer: {
    height: 180,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    position: 'relative',
  },

  // ── Marker card ────────────────────────────────────────────────────────────
  markerCard: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    ...Shadow.md,
  },
  markerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  markerCardInfo: { flex: 1, gap: 2 },
  markerCardName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  markerCardFlag: { fontSize: 13 },
  markerCardMeta: { fontSize: FontSize.sm, color: Colors.textSecondary },
  markerCardStatus: { fontSize: FontSize.xs, color: Colors.textTertiary },
  markerCardClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  markerCardBtnOutline: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCardBtnOutlineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  markerCardBtnPrimary: {
    flex: 1,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  markerCardBtnPrimaryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.white,
  },
  markerCardBtnPending: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.background,
  },
  markerCardBtnPendingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textTertiary,
  },

  // ── Members ────────────────────────────────────────────────────────────────
  membersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  membersTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  membersCount: { color: Colors.primary },
  membersActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  refreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
  },
  resetText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  emptyDesc: { fontSize: FontSize.sm, color: Colors.textTertiary },

  listContent: { paddingBottom: Spacing.xxl },
});
