import React from 'react';
import { TouchableOpacity, Image, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = () => {
  const navigation = useNavigation();
  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Accueil')} style={styles.homeBtn}>
          <Ionicons name="home" size={28} color="#6E3B00" />
        </TouchableOpacity>
        <Text style={styles.title}>Palets & Bières</Text>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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
    paddingTop: 45,
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
    marginLeft: 8,
    marginRight: 8,
  },
  logo: {
    width: 44,
    height: 44,
    marginLeft: 12,
  },
  bottomLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 1,
  },
});

export default CustomHeader;
