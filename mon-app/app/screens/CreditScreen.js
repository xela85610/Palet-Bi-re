import {Image, Pressable, StyleSheet, Text, Animated, Easing, View} from 'react-native';
import { clearStorage } from '../storage/Storage';
import React, {useState} from "react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import {Link} from "expo-router";
import { useNavigation } from '@react-navigation/native';
import {Audio} from "expo-av";

function ZoomPressable({ children, style, ...props }) {
    return (
        <Pressable
            {...props}
            style={({ pressed }) => [
                style,
                { transform: [{ scale: pressed ? 0.9 : 1 }] },
            ]}
        >
            {children}
        </Pressable>
    );
}

export default function CreditScreen() {

    const [modaleDelete, setModaleDelete] = useState(false);
    const navigation = useNavigation();
    const [isDeleting, setIsDeleting] = useState(false);
    const logoScale = React.useRef(new Animated.Value(1)).current;

    const openModale = async () => {
        setModaleDelete(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        logoScale.setValue(1);
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/deleteAll.mp3')
        );
        await sound.playAsync();
        Animated.timing(logoScale, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
            easing: Easing.linear,
        }).start(async () => {
            await clearStorage();
            setIsDeleting(false);
            setModaleDelete(false);
            navigation.navigate('Accueil');
        });
    };

    return (
        <View style={styles.container}>
            {isDeleting ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Text style={{
                        color: '#FF0000',
                        fontWeight: 'bold',
                        fontSize: 24,
                        marginBottom: 50,
                        textAlign: 'center'
                    }}>
                        Suppression en cours...
                    </Text>
                    <Animated.Image
                        source={require('../assets/images/logo.png')}
                        style={{
                            width: 400,
                            height: 400,
                            transform: [{ scale: logoScale }]
                        }}
                        resizeMode="contain"
                    />
                </View>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.titre}>Crédits</Text>
                        <Text style={styles.subtitle}>Développé & Désigné par Axel Charrier</Text>
                        <Text style={styles.subtitle}>
                            Si vous rencontrez un problème sur l'application, un bug ou que vous avez des idées d'améliorations, n'hésitez pas à me contacter :
                        </Text>
                        <Text style={styles.subtitleMail}>charrier.axel85610@gmail.com</Text>
                        <Text style={styles.txtDelete}>Supprimer toutes les données de l'application</Text>
                        <ZoomPressable style={styles.deleteDataBtn} onPress={openModale}>
                            <Text style={styles.deleteDataTxt}>Supprimer</Text>
                        </ZoomPressable>
                        <ConfirmDeleteModal
                            visible={modaleDelete}
                            onCancel={() => setModaleDelete(false)}
                            onConfirm={handleConfirmDelete}
                            title="Voulez-vous vraiment supprimer toutes les données de l'application ?"
                            message="Cette action est irréversible."
                            confirmText="Supprimer"
                            cancelText="Annuler"
                        />
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.gitLink}>
                            <Link href={"https://github.com/xela85610/Palet-Bi-re"}>
                                <Image source={require('../assets/images/github.png')} style={styles.gitImg}/>
                            </Link>
                            <Link href={"https://github.com/xela85610/Palet-Bi-re"}>
                                <Text style={styles.gitTxt}>GitHub</Text>
                            </Link>
                        </View>
                        <Text style={styles.footerTxt}>© 2025 Axel Charrier | Projet open-source</Text>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        padding: 20,
        justifyContent: 'space-between',
    },
    titre: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 40,
        marginTop: 10,
        userSelect: 'none',
    },
    subtitle: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        marginBottom: 25,
        userSelect: 'none',
    },
    subtitleMail: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
        marginBottom: 25,
    },
    txtDelete: {
        fontSize: 20,
        color: '#000',
        textAlign: 'center',
        marginTop: 170,
        marginBottom: 30,
        userSelect: 'none',
    },
    deleteDataBtn: {
        backgroundColor: '#AA0000',
        borderColor: '#FF0000',
        borderWidth: 4,
        borderRadius: 10,
        width: '30%',
        alignSelf: 'center',
        userSelect: 'none',
    },
    deleteDataTxt: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        padding: 10,
        userSelect: 'none',
    },
    footerTxt: {
        textAlign: 'center',
        userSelect: 'none',
    },
    gitLink: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        userSelect: 'none',
        marginBottom: 20,
    },
    gitImg: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        userSelect: 'none',
    },
});