import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../../theme';

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  label?: string;
}

interface MapViewProps {
  markers?: MapMarker[];
  onMarkerPress?: (id: string) => void;
  country?: string;
  countryFlag?: string;
}

/**
 * Leaflet map placeholder — replace WebView body with a full Leaflet HTML
 * string once `react-native-webview` is installed:
 *   npx expo install react-native-webview
 */
export const AppMapView: React.FC<MapViewProps> = ({
  markers = [],
  onMarkerPress,
  country = 'France',
  countryFlag = '🇫🇷',
}) => {
  return (
    <View style={styles.container}>
      {/* Simulated map background */}
      <View style={styles.mapBg}>
        {/* Grid lines */}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: `${i * 20}%` as any }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}

        {/* Country label */}
        <View style={styles.countryLabel}>
          <Text style={styles.countryFlag}>{countryFlag}</Text>
          <Text style={styles.countryText}>{country}</Text>
        </View>

        {/* Markers */}
        {markers.slice(0, 5).map((marker, idx) => (
          <TouchableOpacity
            key={marker.id}
            style={[
              styles.marker,
              {
                top: `${20 + idx * 12}%` as any,
                left: `${20 + idx * 14}%` as any,
              },
            ]}
            onPress={() => onMarkerPress?.(marker.id)}
          >
            <View style={styles.markerDot} />
          </TouchableOpacity>
        ))}

        {/* Tap hint */}
        <View style={styles.hint}>
          <Text style={styles.hintText}>Appuyer sur un marqueur</Text>
        </View>

        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomBtn}>
            <Ionicons name="add" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomBtn}>
            <Ionicons name="remove" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBg: {
    flex: 1,
    backgroundColor: '#D8EBD0',
    overflow: 'hidden',
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  countryLabel: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryFlag: { fontSize: 16 },
  countryText: {
    fontSize: FontSize.sm,
    color: 'rgba(0,0,0,0.4)',
    fontStyle: 'italic',
  },
  marker: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
    borderWidth: 2,
    borderColor: Colors.white,
    ...Shadow.sm,
  },
  hint: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  zoomControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    ...Shadow.md,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
