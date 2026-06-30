import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reference: iPhone 14 / standard phone (390 × 844)
const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

// Cap scaling so tablets don't get absurdly large values
const widthScale = Math.min(SCREEN_WIDTH / BASE_WIDTH, 1.5);
const heightScale = Math.min(SCREEN_HEIGHT / BASE_HEIGHT, 1.5);

/** Full linear scale on width */
export function scale(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * widthScale));
}

/** Full linear scale on height */
export function verticalScale(size: number): number {
  return Math.round(PixelRatio.roundToNearestPixel(size * heightScale));
}

/**
 * Moderate scale — the right choice for spacing, font sizes, icon sizes.
 * factor 0 = no scaling at all, factor 1 = full linear.
 * Default 0.45 feels natural: content grows on larger screens without
 * becoming comically oversized.
 */
export function ms(size: number, factor = 0.45): number {
  return Math.round(
    PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor)
  );
}

export const SCREEN = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
export const isTablet = SCREEN_WIDTH >= 768;
