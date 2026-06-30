import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LeafletMap } from './LeafletMap';
import type { MapMarker } from './LeafletMap';
import { Colors, BorderRadius, Shadow, FontSize, FontWeight, Spacing } from '../../theme';

interface ExpandableMapProps {
  markers?: MapMarker[];
  onMarkerPress?: (id: string) => void;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  /** Height of the collapsed map card (default 200) */
  collapsedHeight?: number;
  title?: string;
}

export const ExpandableMap: React.FC<ExpandableMapProps> = ({
  markers = [],
  onMarkerPress,
  centerLat = 46.2276,
  centerLng = 2.2137,
  zoom = 5,
  collapsedHeight = 200,
  title = 'Carte',
}) => {
  const [expanded, setExpanded] = useState(false);

  const mapProps = { markers, centerLat, centerLng, zoom, onMarkerPress };

  return (
    <>
      {/* ── Collapsed card ─────────────────────────────────────── */}
      <View style={[styles.card, { height: collapsedHeight }]}>
        <LeafletMap {...mapProps} />

        {/* Expand button */}
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setExpanded(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="expand-outline" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>

        {/* Hint pill */}
        <View style={styles.hintPill} pointerEvents="none">
          <Text style={styles.hintText}>Appuyer sur un marqueur</Text>
        </View>
      </View>

      {/* ── Full-screen modal ───────────────────────────────────── */}
      <Modal
        visible={expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setExpanded(false)}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setExpanded(false)}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Full map */}
          <View style={styles.fullMap}>
            <LeafletMap {...mapProps} zoom={zoom + 1} />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  /* Collapsed card */
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  expandBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  hintPill: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },

  /* Full-screen modal */
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullMap: {
    flex: 1,
  },
});
