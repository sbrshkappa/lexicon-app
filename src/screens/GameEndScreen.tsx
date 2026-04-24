import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { gameWinner } from '../game/engine';
import { Button } from '../components/Button';
import { colors, typography, spacing, radius } from '../theme';

export const GameEndScreen: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const endGame = useGameStore((s) => s.endGame);

  const winner = gameWinner(game);
  const ranked = [...game.players].sort((a, b) => a.score - b.score);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text
          entering={FadeInDown.duration(500)}
          style={[typography.overline, styles.kicker]}
        >
          The Game is Decided
        </Animated.Text>

        <Animated.View
          entering={ZoomIn.delay(120).duration(700).springify()}
          style={styles.trophy}
        >
          <Text style={styles.trophyLetter}>
            {winner?.name.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(260).duration(500).springify()}
          style={[typography.display, styles.winnerName]}
          numberOfLines={1}
        >
          {winner?.name ?? 'No one'}
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(320).duration(500).springify()}
          style={[typography.h3, styles.winnerSub]}
        >
          emerges victorious.
        </Animated.Text>

        <View style={styles.divider} />

        <Text style={[typography.overline, { color: colors.inkMuted, marginBottom: spacing.md }]}>
          Final Standing
        </Text>

        {ranked.map((p, i) => (
          <Animated.View
            key={p.id}
            entering={FadeInDown.delay(500 + i * 120).duration(500).springify()}
            style={[styles.row, i === 0 && styles.rowFirst]}
          >
            <Text style={[typography.h2, styles.rank]}>{i + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { color: colors.ink }]}>
                {p.name}
              </Text>
              <Text style={[typography.small, { color: colors.inkMuted }]}>
                {p.isEliminated ? 'Eliminated' : 'Survived'}
              </Text>
            </View>
            <Text style={[typography.h2, { color: i === 0 ? colors.success : colors.inkSoft }]}>
              {p.score}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Return Home"
          variant="primary"
          size="lg"
          fullWidth
          onPress={endGame}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  kicker: {
    color: colors.inkMuted,
    textAlign: 'center',
  },
  trophy: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    shadowColor: colors.accentDeep,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 16,
  },
  trophyLetter: {
    ...typography.display,
    fontSize: 92,
    color: colors.paper,
  },
  winnerName: {
    color: colors.ink,
    textAlign: 'center',
    fontSize: 56,
    lineHeight: 60,
    marginBottom: spacing.xs,
  },
  winnerSub: {
    fontStyle: 'italic',
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: colors.paperEdge,
    marginVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.paperDeep,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paperEdge,
  },
  rowFirst: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(122, 46, 46, 0.04)',
  },
  rank: {
    color: colors.inkMuted,
    width: 36,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderColor: colors.paperEdge,
  },
});
