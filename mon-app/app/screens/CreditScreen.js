import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import { clearStorage } from '../storage/Storage';
import React, {useState} from "react";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import {Link} from "expo-router";
import { useNavigation } from '@react-navigation/native';

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

    const handleClearStorage = async () => {
        await clearStorage();
        setModaleDelete(false);
        navigation.navigate('Accueil');
    };

    const openModale = async () => {
        setModaleDelete(true);
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titre}>Crédits</Text>
                <Text style={styles.subtitle}>Développé & Désigné par Axel Charrier</Text>
                <Text style={styles.subtitle}>Si vous rencontrez un problème sur l'application, un bug ou que vous avez des idées d'améliorations, n'hésitez pas à me contacter :</Text>
                <Text style={styles.subtitleMail}>charrier.axel85610@gmail.com</Text>
                <Text style={styles.txtDelete}>Supprimer toutes les données de l'application</Text>
                <ZoomPressable style={styles.deleteDataBtn} onPress={openModale} ><Text style={styles.deleteDataTxt}>Supprimer</Text></ZoomPressable>
                <ConfirmDeleteModal
                    visible={modaleDelete}
                    onCancel={() => setModaleDelete(false)}
                    onConfirm={handleClearStorage}
                    title="Voulez-vous vraiment supprimer toutes les données de l'application ?"
                    message="Cette action est irréversible."
                    confirmText="Supprimer"
                    cancelText="Annuler"
                />
            </View>
            <View style={styles.footer}>
                <Link href={"https://github.com/xela85610/Palet-Bi-re"} style={styles.gitLink}>
                    <Image source={require('../assets/images/github.png')} style={styles.gitImg}/>
                    GitHub
                </Link>
                <Text style={styles.footerTxt}>© 2025 Axel Charrier | Projet open-source</Text>
            </View>
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        padding: 8,
        userSelect: 'none',
    },
    footerTxt: {
        textAlign: 'center',
        userSelect: 'none',
    },
    gitImg: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        margin: 10,
        userSelect: 'none',
    },
    gitLink: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        userSelect: 'none',
    },

});