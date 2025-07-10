import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useNavigationState  } from '@react-navigation/native';

const CustomHeader = ({ onHomePress }) => {

  const navigation = useNavigation();

  const routeName = useNavigationState(state => state.routes[state.index].name);

  const handleHomePress = () => {
    if (onHomePress) {
      onHomePress();
    } else {
      navigation.navigate('Accueil');
    }
  };

  const handleCreditsPress = () => {
    if (routeName === 'Accueil') {
      navigation.navigate('Crédits');
    }
  };

  return (
      <View>
        <View style={styles.container}>
          <TouchableOpacity onPress={handleHomePress} style={styles.homeBtn}>
            <Ionicons name="home" size={28} color="#6E3B00" />
          </TouchableOpacity>
            <Text style={styles.title}>Palets & Bières</Text>
          <TouchableOpacity onPress={handleCreditsPress}>
            <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
              />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomLine} />
      </View>

  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FFF8EA',
    zIndex: 10,
    userSelect: 'none',
  },
  homeBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6E3B00',
    marginLeft: 10,
    marginRight: 6,
  },
  logo: {
    width: 44,
    height: 44,
  },
  bottomLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
});

export default CustomHeader;
