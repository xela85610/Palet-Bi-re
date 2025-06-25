import React from 'react';
import Home from './screens/Home';
import Joueurs from './screens/Joueurs';
import Regles from './screens/Regles';
import Classement from './screens/Classement';
import Historique from './screens/Historique';

import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export default function Index() {
  return (
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Accueil" id={}>
            <Stack.Screen name="Accueil" component={Home} options={{ headerShown: false }} />
            <Stack.Screen name="Joueurs" component={Joueurs} />
            <Stack.Screen name="Règles" component={Regles} />
            <Stack.Screen name="Classement" component={Classement} />
            <Stack.Screen name="Historique" component={Historique} />
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
  );
}
