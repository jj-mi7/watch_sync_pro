import React from 'react';
import { View } from 'react-native';
import Colors from '@/constants/colors';

const C = Colors.dark;

interface SignalBarsProps {
  rssi: number | null;
}

export function SignalBars({ rssi }: SignalBarsProps) {
  if (rssi == null) return null;
  const strength = rssi > -60 ? 3 : rssi > -80 ? 2 : 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {[1, 2, 3].map(b => (
        <View
          key={b}
          style={{
            width: 4,
            height: 4 + b * 4,
            borderRadius: 2,
            backgroundColor: b <= strength ? C.accentGreen : C.border,
          }}
        />
      ))}
    </View>
  );
}
