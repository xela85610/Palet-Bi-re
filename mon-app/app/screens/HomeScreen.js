import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import CreateGameModal from '../components/CreateGameModal';
import { Audio } from 'expo-av';

const screenWidth = Dimensions.get('window').width;

const MenuButton = ({ title, icon, color, iconColor, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            speed: 30,
            bounciness: 8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            speed: 20,
            bounciness: 10,
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

    const [modalVisible, setModalVisible] = React.useState(false);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.92,
            speed: 30,
            bounciness: 8,
            useNativeDriver: true,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            speed: 20,
            bounciness: 10,
            useNativeDriver: true,
        }).start();
    };

    async function playSound() {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/button.mp3')
        );
        await sound.playAsync();
    }

    return (
        <View style={styles.container}>
            <Text style={styles.subtitle}>Visez, lancez, trinquez – le palet comme on l’aime !</Text>

            <View style={styles.menuGrid}>
                <MenuButton
                    title="Joueurs"
                    color="#CFE5FF"
                    iconColor="#203D80"
                    icon={<MaterialCommunityIcons name="account-group" size={40} color="#203D80" />}
                    onPress={() => { playSound(); navigation.navigate('Joueurs'); }}
                />
                <MenuButton
                    title="Règles"
                    color="#FFD7B5"
                    iconColor="#C25E00"
                    icon={<MaterialCommunityIcons name="file-document-edit" size={40} color="#C25E00" />}
                    onPress={() => { playSound(); navigation.navigate('Règles'); }}
                />
                <MenuButton
                    title="Classements"
                    color="#FFE899"
                    iconColor="#C27C00"
                    icon={<FontAwesome5 name="trophy" size={36} color="#C27C00" />}
                    onPress={() => { playSound(); navigation.navigate('Classement'); }}
                />
                <MenuButton
                    title="Historique"
                    color="#D7DDE8"
                    iconColor="#3A4F66"
                    icon={<Feather name="calendar" size={40} color="#3A4F66" />}
                    onPress={() => { playSound(); navigation.navigate('Historique'); }}
                />
            </View>

            <View style={styles.bottomButtonContainer}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <Pressable
                        style={styles.newGameButton}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        onPress={() => setModalVisible(true)}
                    >
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logoButton}
                            resizeMode="contain"
                        />
                        <View style={styles.refletOverlay} pointerEvents="none" />
                        <Text style={styles.newGameText}>Jouer</Text>
                    </Pressable>
                </Animated.View>
            </View>
            <CreateGameModal visible={modalVisible} onClose={() => setModalVisible(false)} />
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
        userSelect: 'none',
    },
    subtitle: {
        fontSize: 16,
        color: '#B05C00',
        marginBottom: 35,
        fontWeight: 'bold',
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: screenWidth * 0.95,
        marginBottom: 40,
    },
    menuButton: {
        width: screenWidth * 0.4,
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
    bottomButtonContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: 'auto',
        marginTop: 20,
        marginBottom: 0,
        paddingBottom: 50,
    },
    newGameButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#B0B4B8',
        borderWidth: 7,
        borderColor: '#718096',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    refletOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '55%',
        borderTopLeftRadius: 90,
        borderTopRightRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.28)',
        opacity: 0.7,
        transform: [{ rotate: '-8deg' }],
    },
    newGameText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    logoButton: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
});
