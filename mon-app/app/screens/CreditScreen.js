import {StyleSheet, View} from 'react-native';
import { clearStorage } from '../storage/Storage';

export default function CreditScreen() {

    const handleClearStorage = async () => {
        await clearStorage();
    };

    return (
        <View style={styles.container}>Crédits</View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8EA',
        alignItems: 'center',
        paddingTop: 30,
    },
});