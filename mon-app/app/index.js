import React from 'react';
import HomeScreen from './screens/HomeScreen';
import JoueurScreen from './screens/JoueurScreen';
import RegleScreen from './screens/RegleScreen';
import ClassementScreen from './screens/./ClassementScreen';
import HistoriqueScreen from './screens/HistoriqueScreen';
import { LogBox } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from './components/CustomHeader';

LogBox.ignoreLogs([
  'Warning: Invalid prop `style` supplied to `React.Fragment`',
]);

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Accueil"
          screenOptions={{ header: () => <CustomHeader /> }}
        >
          <Stack.Screen name="Accueil" component={HomeScreen} />
          <Stack.Screen name="Joueurs" component={JoueurScreen} />
          <Stack.Screen name="Règles" component={RegleScreen} />
          <Stack.Screen name="Classement" component={ClassementScreen} />
          <Stack.Screen name="Historique" component={HistoriqueScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
