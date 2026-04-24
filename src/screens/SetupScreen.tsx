import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { colors, typography, spacing, radius } from '../theme';

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;

export const SetupScreen: React.FC = () => {
  const navigate = useGameStore((s) => s.navigate);
  const newGame = useGameStore((s) => s.newGame);
  const [names, setNames] = useState<string[]>(['', '']);

  const canStart = names
    .slice(0, names.length)
    .every((n) => n.trim().length > 0);

  const addPlayer = () => {
    if (names.length < MAX_PLAYERS) setNames([...names, '']);
  };
  const removePlayer = (i: number) => {
    if (names.length > MIN_PLAYERS) {
      setNames(names.filter((_, idx) => idx !== i));
    }
  };
  const updateName = (i: number, v: string) => {
    const copy = [...names];
    copy[i] = v;
    setNames(copy);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => navigate('home')} style={styles.back}>
              <Text style={[typography.body, { color: colors.inkMuted }]}>← Back</Text>
            </Pressable>
            <Text style={[typography.overline, { color: colors.inkMuted }]}>New Game</Text>
          </View>

          <Animated.Text
            entering={FadeInDown.duration(400)}
            style={[typography.h1, styles.title]}
          >
            Who's playing?
          </Animated.Text>

          <Text style={[typography.body, { color: colors.inkMuted, marginBottom: spacing.xl }]}>
            Enter 2–4 player names. You'll pass the device between turns.
          </Text>

          <View style={styles.inputs}>
            {names.map((n, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 80).duration(320)}
                style={styles.inputRow}
              >
                <Text style={[typography.h2, styles.seat]}>{i + 1}</Text>
                <TextInput
                  value={n}
                  onChangeText={(v) => updateName(i, v)}
                  placeholder={`Player ${i + 1}`}
                  placeholderTextColor={colors.inkGhost}
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={18}
                  returnKeyType={i === names.length - 1 ? 'done' : 'next'}
                />
                {names.length > MIN_PLAYERS && (
                  <Pressable onPress={() => removePlayer(i)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>×</Text>
                  </Pressable>
                )}
              </Animated.View>
            ))}

            {names.length < MAX_PLAYERS && (
              <Pressable onPress={addPlayer} style={styles.addBtn}>
                <Text style={styles.addText}>+ Add player</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label="Deal the cards"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStart}
            onPress={() => newGame(names.map((n) => n.trim()))}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  back: { padding: spacing.xs, marginLeft: -spacing.xs },
  title: {
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  inputs: {
    marginTop: spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  seat: {
    color: colors.inkMuted,
    width: 28,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    marginLeft: spacing.md,
    ...typography.h3,
    color: colors.ink,
    paddingVertical: spacing.xs,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    ...typography.h2,
    color: colors.inkMuted,
    lineHeight: 28,
  },
  addBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  addText: {
    ...typography.button,
    color: colors.accent,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.paperEdge,
    backgroundColor: colors.paper,
  },
});
