import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Letter } from '../game/types';
import { colors, typography, spacing, radius } from '../theme';

const LETTERS: Letter[] = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
];

export interface WildLetterPickerProps {
  visible: boolean;
  current?: Letter;
  onPick: (letter: Letter) => void;
  onCancel: () => void;
}

export const WildLetterPicker: React.FC<WildLetterPickerProps> = ({
  visible,
  current,
  onPick,
  onCancel,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(180)}
          exiting={SlideOutDown.duration(220)}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <Text style={[typography.overline, { color: colors.inkMuted, textAlign: 'center' }]}>
            Wild card
          </Text>
          <Text style={[typography.h2, styles.title]}>
            Choose a letter
          </Text>

          <ScrollView contentContainerStyle={styles.grid}>
            {LETTERS.map((l) => {
              const isCurrent = l === current;
              return (
                <Pressable
                  key={l}
                  onPress={() => onPick(l)}
                  style={[
                    styles.letter,
                    isCurrent && styles.letterActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.letterText,
                      { color: isCurrent ? colors.paper : colors.ink },
                    ]}
                  >
                    {l}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.paperEdge,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: spacing.md,
  },
  letter: {
    width: 52,
    height: 52,
    margin: 4,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.paperEdge,
  },
  letterActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  letterText: {
    ...typography.cardLetter,
    fontSize: 22,
  },
});
