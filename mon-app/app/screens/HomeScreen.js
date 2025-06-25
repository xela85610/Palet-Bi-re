import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const MenuButton = ({ title, icon, color, iconColor, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={[styles.menuButton, { backgroundColor: color }]}
            >
                {icon}
                <Text style={[styles.menuText, { color: iconColor }]}>{title}</Text>
            </Pressable>
        </Animated.View>
    );
};

export default function HomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>"Visez, lancez, trinquez – le palet comme on l’aime !"</Text>

            <View style={styles.menuGrid}>
                <MenuButton
                    title="Joueurs"
                    color="#CFE5FF"
                    iconColor="#203D80"
                    icon={<MaterialCommunityIcons name="account-group" size={40} color="#203D80" />}
                    onPress={() => navigation.navigate('Joueurs')}
                />
                <MenuButton
                    title="Règles"
                    color="#FFD7B5"
                    iconColor="#C25E00"
                    icon={<MaterialCommunityIcons name="file-document-edit" size={40} color="#C25E00" />}
                    onPress={() => navigation.navigate('Règles')}
                />
                <MenuButton
                    title="Classement"
                    color="#FFE899"
                    iconColor="#C27C00"
                    icon={<FontAwesome5 name="trophy" size={36} color="#C27C00" />}
                    onPress={() => navigation.navigate('Classement')}
                />
                <MenuButton
                    title="Historique"
                    color="#D7DDE8"
                    iconColor="#3A4F66"
                    icon={<Feather name="calendar" size={40} color="#3A4F66" />}
                    onPress={() => navigation.navigate('Historique')}
                />
            </View>

            <Pressable style={styles.newGameButton}>
                <Text style={styles.newGameText}>Nouvelle Partie</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#B05C00',
        marginBottom: 35,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: screenWidth * 0.9,
        marginBottom: 40,
    },
    menuButton: {
        width: screenWidth * 0.35,
        height: 130,
        margin: 10,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 2, height: 2 },
        shadowRadius: 6,
    },
    menuText: {
        marginTop: 8,
        fontWeight: '600',
        fontSize: 16,
    },
    newGameButton: {
        position: 'absolute',
        bottom: 40,
        backgroundColor: '#444',
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 8,
    },
    newGameText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
