/**
 * Scaling utilities using react-native-size-matters
 * Use moderateScale for all dimensions to ensure consistent sizing across devices
 */
export {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from "react-native-size-matters";

/**
 * Shorthand for moderateScale with custom factor
 * @param size - base size value
 * @param factor - scaling factor (default 0.5, use 0.25 for subtle, 0.75 for aggressive)
 */
export { moderateScale as ms } from "react-native-size-matters";
