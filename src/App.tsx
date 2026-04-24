import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useFraunces,
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_700Bold,
  Fraunces_900Black,
  Fraunces_400Regular_Italic,
} from '@expo-google-fonts/fraunces';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { useGameStore } from './store/gameStore';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { GameScreen } from './screens/GameScreen';
import { RoundEndScreen } from './screens/RoundEndScreen';
import { GameEndScreen } from './screens/GameEndScreen';
import { ToastHost } from './components/ToastHost';
import { colors, typography } from './theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const App: React.FC = () => {
  const [frauncesLoaded] = useFraunces({
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_700Bold,
    Fraunces_900Black,
    Fraunces_400Regular_Italic,
  });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = frauncesLoaded && interLoaded;

  const onLayout = useCallback(async () => {
    if (fontsReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsReady]);

  const screen = useGameStore((s) => s.screen);

  if (!fontsReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.root} onLayout={onLayout}>
          {screen === 'home' && <HomeScreen />}
          {screen === 'setup' && <SetupScreen />}
          {screen === 'game' && <GameScreen />}
          {screen === 'round-end' && <RoundEndScreen />}
          {screen === 'game-end' && <GameEndScreen />}
          <ToastHost />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.paper,
  },
});

export default App;
