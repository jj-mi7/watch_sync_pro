import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MapPin, Activity, Zap, Wind, Droplets, TrendingUp, Flame, Moon, Sun, BarChart2, Package, Award, ChevronDown, ChevronUp, Thermometer } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useFitness } from "@/context/FitnessContext";

const C = Colors.dark;
const F = { regular: "SpaceGrotesk_400Regular", medium: "SpaceGrotesk_500Medium", semibold: "SpaceGrotesk_600SemiBold", bold: "SpaceGrotesk_700Bold" };

const TIPS = [
  { id: "1", category: "walking", title: "10,000 Steps Myth", body: "The 10,000 steps target originated from a 1965 Japanese marketing campaign. Research shows 7,000–8,000 steps/day significantly reduces mortality risk. Quality beats quantity.", Icon: MapPin, color: C.accentTeal },
  { id: "2", category: "fitness", title: "Zone 2 Cardio", body: "Walking where you can hold a conversation is Zone 2 — efficient fat burning, better mitochondrial density, improved aerobic base without excessive recovery.", Icon: Activity, color: C.accent },
  { id: "3", category: "walking", title: "Cadence Boost", body: "Aim for 100+ steps per minute. Faster cadence increases calorie burn by 20-30% versus slow walking at the same distance.", Icon: Zap, color: C.accentGreen },
  { id: "4", category: "recovery", title: "Post-Walk Stretch", body: "Stretch calves, hamstrings, and hip flexors for 30 seconds each within 10 minutes of finishing. Reduces soreness and improves long-term flexibility.", Icon: Wind, color: C.accentBlue },
  { id: "5", category: "nutrition", title: "Hydration = Performance", body: "Losing just 2% of body water drops performance by 20%. Target 0.5L/hour of walking. Add a pinch of salt on hot days for electrolytes.", Icon: Droplets, color: C.accentBlue },
  { id: "6", category: "walking", title: "Incline Walking", body: "A 5-10% incline triples calorie burn vs flat walking. Hills activate glutes and hamstrings more effectively, building strength passively.", Icon: TrendingUp, color: C.accentTeal },
  { id: "7", category: "fitness", title: "NEAT: Hidden Calorie Burn", body: "Non-Exercise Activity Thermogenesis burns 300-700 extra calories daily. Take stairs, park further, pace during calls. Your Casio tracks all of it.", Icon: Flame, color: C.warning },
  { id: "8", category: "recovery", title: "Sleep Multiplies Results", body: "Growth hormone releases during deep sleep. Below 7hrs raises cortisol, promotes fat storage, slows recovery. Optimize sleep before optimizing steps.", Icon: Moon, color: C.accentBlue },
  { id: "9", category: "walking", title: "Morning Walks & Circadian", body: "10 minutes of morning sunlight walks sets your circadian rhythm, boosts serotonin, and reduces evening sugar cravings. Proven science.", Icon: Sun, color: C.warning },
  { id: "10", category: "fitness", title: "Progressive Overload", body: "Add 500 steps to your daily target every 2 weeks. This progressive overload principle keeps your body adapting and prevents plateaus.", Icon: BarChart2, color: C.accent },
  { id: "11", category: "nutrition", title: "Protein & Walking", body: "0.8-1g protein per pound of bodyweight supports muscle maintenance during daily walking. Protein has the highest thermic effect — 25-30% of calories burned in digestion.", Icon: Package, color: C.accentGreen },
  { id: "12", category: "walking", title: "KM Milestones Matter", body: "Celebrate every 100km walked. Milestone celebrations increase long-term adherence by 40%. Track cumulative distance in the Graphs tab.", Icon: Award, color: C.accentGreen },
];

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "walking", label: "Walking" },
  { key: "fitness", label: "Fitness" },
  { key: "nutrition", label: "Nutrition" },
  { key: "recovery", label: "Recovery" },
];

const KM_BADGES = [
  { km: 1, label: "First Step", color: C.textMuted },
  { km: 10, label: "Ten KM Club", color: C.accentTeal },
  { km: 50, label: "50K Walker", color: C.accentBlue },
  { km: 100, label: "Century", color: C.accent },
  { km: 250, label: "Quarter Pro", color: C.accentGreen },
  { km: 500, label: "Half Thousand", color: C.warning },
  { km: 1000, label: "Kilomaster", color: C.error },
];

function TipCard({ tip, index }: { tip: typeof TIPS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <TouchableOpacity style={[styles.tipCard, { borderLeftColor: tip.color }]} onPress={() => setExpanded(e => !e)} activeOpacity={0.85}>
        <View style={styles.tipHeader}>
          <View style={[styles.tipIconBg, { backgroundColor: `${tip.color}22` }]}>
            <tip.Icon size={16} color={tip.color} strokeWidth={2} />
          </View>
          <Text style={styles.tipTitle} numberOfLines={expanded ? undefined : 1}>{tip.title}</Text>
          {expanded ? <ChevronUp size={18} color={C.textMuted} /> : <ChevronDown size={18} color={C.textMuted} />}
        </View>
        {expanded && <Text style={styles.tipBody}>{tip.body}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TipsScreen() {
  const insets = useSafeAreaInsets();
  const { activityLogs } = useFitness();
  const [activeCategory, setActiveCategory] = useState("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = activeCategory === "all" ? TIPS : TIPS.filter(t => t.category === activeCategory);
  const totalKm = activityLogs.reduce((s, l) => s + l.distanceKm, 0);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Tips & Insights</Text>
          <Text style={styles.subtitle}>Science-backed fitness knowledge</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key} style={[styles.catChip, activeCategory === cat.key && styles.catChipActive]} onPress={() => setActiveCategory(cat.key)}>
              <Text style={[styles.catText, activeCategory === cat.key && styles.catTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 20, gap: 10, marginBottom: 24 }}>
          {filtered.map((tip, i) => <TipCard key={tip.id} tip={tip} index={i} />)}
        </View>

        <View style={styles.sectionHeader}>
          <Award size={18} color={C.accentGreen} strokeWidth={2} />
          <Text style={styles.sectionTitle}>KM Badges</Text>
          <Text style={styles.totalKm}>{totalKm.toFixed(1)} km total</Text>
        </View>
        <View style={styles.badgesGrid}>
          {KM_BADGES.map(badge => {
            const earned = totalKm >= badge.km;
            return (
              <View key={badge.km} style={[styles.badgeCard, { borderColor: `${badge.color}${earned ? "88" : "22"}`, opacity: earned ? 1 : 0.45 }]}>
                <View style={[styles.badgeIcon, { backgroundColor: `${badge.color}22` }]}>
                  <Award size={20} color={badge.color} strokeWidth={earned ? 2 : 1.5} />
                </View>
                <Text style={[styles.badgeKm, { color: badge.color }]}>{badge.km}km</Text>
                <Text style={styles.badgeName}>{badge.label}</Text>
                {earned && <Text style={[styles.badgeEarned, { color: badge.color }]}>✓ Earned</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { color: C.text, fontSize: 28, fontFamily: F.bold },
  subtitle: { color: C.textMuted, fontSize: 14, fontFamily: F.regular, marginTop: 4 },
  catScroll: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.backgroundCard },
  catChipActive: { backgroundColor: `${C.accent}22`, borderColor: C.accent },
  catText: { color: C.textMuted, fontFamily: F.medium, fontSize: 13 },
  catTextActive: { color: C.accent },
  tipCard: { backgroundColor: C.backgroundCard, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3 },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIconBg: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  tipTitle: { flex: 1, color: C.text, fontFamily: F.semibold, fontSize: 14 },
  tipBody: { color: C.textSecondary, fontFamily: F.regular, fontSize: 13, lineHeight: 20, marginTop: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { color: C.text, fontFamily: F.semibold, fontSize: 17, flex: 1 },
  totalKm: { color: C.textMuted, fontFamily: F.regular, fontSize: 12 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  badgeCard: { width: "30%", backgroundColor: C.backgroundCard, borderRadius: 14, padding: 12, alignItems: "center", gap: 4, borderWidth: 1 },
  badgeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  badgeKm: { fontFamily: F.bold, fontSize: 14 },
  badgeName: { color: C.textMuted, fontFamily: F.regular, fontSize: 10, textAlign: "center" },
  badgeEarned: { fontFamily: F.semibold, fontSize: 10 },
});
