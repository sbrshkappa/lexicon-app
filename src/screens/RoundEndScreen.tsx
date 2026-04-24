import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { colors, typography, spacing, radius } from '../theme';
import { LetterCard } from '../components/LetterCard';

export const RoundEndScreen: React.FC = () => {
  const game = useGameStore((s) => s.game)!;
  const nextRound = useGameStore((s) => s.startNextRound);
  const endGame = useGameStore((s) => s.endGame);

  const result = game.lastRoundResult;
  if (!result) return null;

  const winner = game.players.find((p) => p.id === result.winnerId)!;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.Text
          entering={FadeIn.duration(360)}
          style={[typography.overline, { color: colors.inkMuted, textAlign: 'center' }]}
        >
          Round {game.round} Complete
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(80).duration(520).springify()}
          style={[typography.h1, styles.winner]}
        >
          {winner.name} went out.
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(160).duration(520).springify()}
          style={[typography.body, { color: colors.inkSoft, textAlign: 'center', marginTop: spacing.sm }]}
        >
          Other players collect penalty points for cards left in hand.
        </Animated.Text>

        <View style={styles.divider} />

        {result.perPlayer.map((entry, idx) => {
          const player = game.players.find((p) => p.id === entry.playerId)!;
          const isWinner = entry.playerId === result.winnerId;
          return (
            <Animated.View
              key={entry.playerId}
              entering={FadeInDown.delay(220 + idx * 120).duration(500).springify()}
              style={styles.row}
            >
              <View style={styles.rowTop}>
                <View>
                  <Text style={[typography.h3, { color: colors.ink }]}>{player.name}</Text>
                  <Text style={[typography.small, { color: colors.inkMuted }]}>
                    Total: {player.score} {player.score >= game.eliminationThreshold ? '(eliminated)' : ''}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[
                      typography.h1,
                      {
                        color: isWinner ? colors.success : colors.accent,
                        fontSize: 30,
                      },
                    ]}
                  >
                    {isWinner ? '—' : `+${entry.pointsGained}`}
                  </Text>
                  <Text style={[typography.overline, { color: colors.inkMuted }]}>
                    {isWinner ? 'Winner' : 'Penalty'}
                  </Text>
                </View>
              </View>
              {entry.cardsHeld.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cardStrip}
                >
                  {entry.cardsHeld.map((c) => (
                    <View key={c.id} style={{ marginRight: 4 }}>
                      <LetterCard card={c} variant="board" />
                    </View>
                  ))}
                </ScrollView>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Exit Game" variant="ghost" size="md" onPress={endGame} />
        <Button label="Next Round" variant="primary" size="lg" onPress={nextRound} />
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
  },
  winner: {
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  divider: {
    alignSelf: 'center',
    width: 48,
    height: 1,
    backgroundColor: colors.paperEdge,
    marginVertical: spacing.xl,
  },
  row: {
    borderWidth: 1,
    borderColor: colors.paperEdge,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    backgroundColor: colors.paperDeep,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStrip: {
    paddingTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderColor: colors.paperEdge,
    gap: spacing.md,
  },
});
