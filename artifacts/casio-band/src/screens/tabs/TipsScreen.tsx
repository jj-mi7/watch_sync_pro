import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Zap, Heart, Moon, Droplets, Apple, ChevronDown, ChevronUp, Shield, Award } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { F } from '@/constants/fonts';

const C = Colors.dark;

interface TipItem { title: string; body: string }
interface TipSection { id: string; Icon: any; color: string; title: string; tips: TipItem[] }

const TIPS: TipSection[] = [
  {
    id: 'steps',
    Icon: Zap,
    color: C.accent,
    title: 'Daily Steps',
    tips: [
      { title: 'Take the stairs', body: 'Opt for stairs over elevators whenever possible. Just 3 flights a day adds ~600 steps.' },
      { title: 'Walking meetings', body: 'Turn calls or meetings into walking sessions. You\'ll think better and hit your goal faster.' },
      { title: 'Park further away', body: 'Parking at the far end of lots adds 200–400 extra steps per trip.' },
      { title: 'Lunch walk', body: 'A 10-minute walk after lunch helps digestion and adds ~1,000 steps.' },
    ],
  },
  {
    id: 'heart',
    Icon: Heart,
    color: C.error,
    title: 'Heart Health',
    tips: [
      { title: 'Zone 2 training', body: 'Keep heart rate at 60–70% of your max for fat burning and cardiovascular health.' },
      { title: 'Consistent pace', body: 'Steady moderate-intensity exercise is more sustainable than occasional intense bursts.' },
      { title: 'Morning walks', body: 'Walking in the morning regulates blood pressure and boosts mental clarity for the day.' },
    ],
  },
  {
    id: 'recovery',
    Icon: Moon,
    color: C.accentBlue,
    title: 'Recovery',
    tips: [
      { title: 'Sleep 7–9 hours', body: 'Sleep is when your body repairs muscle tissue and consolidates motor skills from the day.' },
      { title: 'Active rest days', body: 'Light walks on rest days maintain blood flow without taxing your muscles.' },
      { title: 'Stretch daily', body: 'Even 5 minutes of stretching improves flexibility and reduces injury risk by 20%.' },
    ],
  },
  {
    id: 'hydration',
    Icon: Droplets,
    color: C.accentTeal,
    title: 'Hydration',
    tips: [
      { title: 'Drink before you\'re thirsty', body: 'Thirst signals dehydration. Aim for 2.5–3.5 L of water daily based on activity.' },
      { title: 'Electrolytes matter', body: 'After a sweaty session, replace sodium and potassium for faster recovery.' },
      { title: 'Morning hydration', body: 'Drink 500ml upon waking to kick-start metabolism and flush overnight toxins.' },
    ],
  },
  {
    id: 'nutrition',
    Icon: Apple,
    color: C.accentGreen,
    title: 'Nutrition',
    tips: [
      { title: 'Protein timing', body: 'Consume 20–30g of protein within 30 minutes post-exercise for optimal muscle repair.' },
      { title: 'Complex carbs', body: 'Whole grains, oats, and sweet potatoes provide sustained energy for long walks and workouts.' },
      { title: 'Pre-walk snack', body: 'A banana or handful of nuts 30 minutes before exercise provides clean energy.' },
    ],
  },
];

function TipCard({ tip, delay }: { tip: TipItem; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.tipCard}>
      <View style={styles.tipBullet} />
      <View style={{ flex: 1 }}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipBody}>{tip.body}</Text>
      </View>
    </Animated.View>
  );
}

function Section({ section, index }: { section: TipSection; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <View style={[styles.section, { borderColor: `${section.color}33` }]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen(o => !o)} activeOpacity={0.8}>
        <View style={[styles.sectionIcon, { backgroundColor: `${section.color}22` }]}>
          <section.Icon size={18} color={section.color} strokeWidth={2} />
        </View>
        <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
        <View style={styles.tipCount}>
          <Text style={[styles.tipCountText, { color: section.color }]}>{section.tips.length}</Text>
        </View>
        {open ? <ChevronUp size={18} color={C.textMuted} /> : <ChevronDown size={18} color={C.textMuted} />}
      </TouchableOpacity>
      {open && (
        <View style={styles.sectionBody}>
          {section.tips.map((tip, i) => (
            <TipCard key={tip.title} tip={tip} delay={i * 40} />
          ))}
        </View>
      )}
    </View>
  );
}

export function TipsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 60 : insets.top + 4;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify()} style={styles.header}>
          <View style={styles.headerIcon}>
            <Shield size={22} color={C.accent} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.title}>Fitness Tips</Text>
            <Text style={styles.subtitle}>Science-backed guidance for your journey</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.featuredCard}>
          <Award size={20} color={C.warning} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.featuredTitle}>Did you know?</Text>
            <Text style={styles.featuredBody}>Walking 8,000 steps daily reduces all-cause mortality by 51% compared to 4,000 steps. Every step counts.</Text>
          </View>
        </Animated.View>

        <View style={styles.sectionsContainer}>
          {TIPS.map((section, i) => (
            <Animated.View key={section.id} entering={FadeInDown.delay(80 + i * 50).springify()}>
              <Section section={section} index={i} />
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 20 },
  headerIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: `${C.accent}22`, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.borderGlow },
  title: { color: C.text, ...F.bold, fontSize: 24 },
  subtitle: { color: C.textMuted, ...F.regular, fontSize: 13, marginTop: 2 },
  featuredCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: 20, backgroundColor: `${C.warning}15`, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${C.warning}44`, marginBottom: 20 },
  featuredTitle: { color: C.warning, ...F.semibold, fontSize: 14, marginBottom: 4 },
  featuredBody: { color: C.text, ...F.regular, fontSize: 13, lineHeight: 20 },
  sectionsContainer: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  section: { backgroundColor: C.backgroundCard, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  sectionIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { flex: 1, ...F.semibold, fontSize: 15 },
  tipCount: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, backgroundColor: C.backgroundElevated },
  tipCountText: { ...F.bold, fontSize: 12 },
  sectionBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  tipCard: { flexDirection: 'row', gap: 12, backgroundColor: C.backgroundElevated, borderRadius: 12, padding: 12 },
  tipBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent, marginTop: 6 },
  tipTitle: { color: C.text, ...F.semibold, fontSize: 13, marginBottom: 4 },
  tipBody: { color: C.textSecondary, ...F.regular, fontSize: 12, lineHeight: 18 },
});
