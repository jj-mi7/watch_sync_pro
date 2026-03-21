import type React from "react";
import { Text } from "react-native";
import { moderateScale } from "react-native-size-matters";

/**
 * Lightweight icon component using Unicode symbols.
 * No native dependencies — works everywhere.
 */

const ICONS: Record<string, string> = {
  // Tab bar
  home: "⌂",
  activity: "◉",
  shoe: "👟",
  watch: "⌚",
  user: "🧑‍🚀",
  settings: "🛠️",
  // Quick actions
  smartphone: "📱",
  camera: "📷",
  "bar-chart-2": "📈",
  // Actions
  "refresh-cw": "🔄",
  "edit-2": "✏️",
  heart: "♥",
  // Status
  check: "✓",
  x: "✕",
  "alert-circle": "⚠",
  bluetooth: "ᛒ",
  // Navigation
  "chevron-right": "›",
  "chevron-left": "‹",
  plus: "+",
  minus: "−",
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = "#fff", style }) => {
  const icon = ICONS[name] || "•";
  return (
    <Text
      style={[
        {
          fontSize: moderateScale(size),
          color,
          textAlign: "center",
          lineHeight: moderateScale(size + 4),
        },
        style,
      ]}
    >
      {icon}
    </Text>
  );
};
