import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthService } from './src/services/AuthService';
import { useStore } from './src/store/useStore';
import { Colors } from './src/theme';
import { generateDemoHistory } from './src/utils/helpers';

const App: React.FC = () => {
  const { loadFromStorage, activityHistory, setActivityHistory } = useStore();

  useEffect(() => {
    AuthService.configure();
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (activityHistory.length === 0) {
      const demo = generateDemoHistory();
      setActivityHistory(demo);
    }
  }, [activityHistory.length]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <AppNavigator />
    </>
  );
};

export default App;
