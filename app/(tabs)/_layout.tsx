import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Colors, FontWeight, Size } from '../../theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Array<{
  name: string;
  labelKey: string;
  icon: IoniconName;
  iconFocused: IoniconName;
}> = [
  { name: 'diaspora',  labelKey: 'tabs.diaspora',  icon: 'earth-outline',    iconFocused: 'earth'      },
  { name: 'produits',  labelKey: 'tabs.produits',  icon: 'map-outline',       iconFocused: 'map'        },
  { name: 'facture',   labelKey: 'tabs.facture',   icon: 'receipt-outline',   iconFocused: 'receipt'    },
  { name: 'livraison', labelKey: 'tabs.livraison', icon: 'cube-outline',       iconFocused: 'cube'       },
  { name: 'announces', labelKey: 'tabs.announces', icon: 'megaphone-outline', iconFocused: 'megaphone'  },
];

const ICON_SIZE = 21;
const LABEL_SIZE = 11;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: Colors.tabBarBorder,
          height: Size.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: Platform.OS === 'ios' ? 6 : 4,
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 0,
          paddingVertical: 0,
        },
        tabBarIconStyle: { marginBottom: 0 },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarButton: ({ children, onPress, style }) => (
              <TouchableOpacity
                style={style as any}
                activeOpacity={0.7}
                onPress={(e) => {
                  Haptics.selectionAsync().catch(() => {});
                  onPress?.(e);
                }}
              >
                {children}
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={ICON_SIZE}
                color={color}
              />
            ),
            tabBarLabel: ({ color }) => (
              <Text
                style={[styles.tabLabel, { color }]}
                numberOfLines={1}
                allowFontScaling={false}
              >
                {t(tab.labelKey)}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: LABEL_SIZE,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    marginTop: 2,
    includeFontPadding: false,
  },
});
