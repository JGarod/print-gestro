import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    PermissionsAndroid,
    Platform,
    Modal,
} from 'react-native';
import { PrinterService } from './src/services/PrinterService';
import { PdfService } from './src/services/PdfService';

const COLORS = {
    primary: '#00f2ff',
    secondary: '#7000ff',
    background: '#0a0a0f',
    surface: '#1a1a2e',
    text: '#ffffff',
    textDim: '#a0a0b0',
};

function App(): React.JSX.Element {
    const [devices, setDevices] = useState({ found: [], paired: [] });
    const [scanning, setScanning] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState(null);
    const [paperWidth, setPaperWidth] = useState(58); // Default to 58mm
    const [currentPdf, setCurrentPdf] = useState(null);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        requestPermissions();
    }, []);

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const permissions = [
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            ];
            const granted = await PermissionsAndroid.requestMultiple(permissions);
            console.log('Permissions granted:', granted);
        }
    };

    const scan = async () => {
        setScanning(true);
        const results = await PrinterService.scanDevices();
        setDevices(results);
        setScanning(false);
    };

    const connect = async (device) => {
        setConnecting(true);
        const success = await PrinterService.connect(device.address);
        if (success) {
            setConnectedDevice(device);
            Alert.alert('Éxito', `Conectado a ${device.name}`);
        } else {
            Alert.alert('Error', 'No se pudo conectar a la impresora');
        }
        setConnecting(false);
    };

    const printTest = async () => {
        if (!connectedDevice) return;
        await PrinterService.printTest();
    };

    const renderDevice = ({ item }) => (
        <TouchableOpacity
            style={styles.deviceCard}
            onPress={() => connect(item)}
            disabled={connecting}
        >
            <View>
                <Text style={styles.deviceName}>{item.name || 'Dispositivo sin nombre'}</Text>
                <Text style={styles.deviceAddress}>{item.address}</Text>
            </View>
            {connectedDevice?.address === item.address && (
                <View style={styles.connectedBadge}>
                    <Text style={styles.connectedText}>VINCULADO</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <Text style={styles.title}>Gestro Print</Text>
                <Text style={styles.subtitle}>Configuración de Impresora</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.statusSection}>
                    <Text style={styles.sectionTitle}>Tamaño de Papel</Text>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.smallBtn, paperWidth === 58 && styles.activeBtn]}
                            onPress={() => setPaperWidth(58)}
                        >
                            <Text style={styles.btnText}>58mm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.smallBtn, paperWidth === 80 && styles.activeBtn]}
                            onPress={() => setPaperWidth(80)}
                        >
                            <Text style={styles.btnText}>80mm</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.deviceSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Dispositivos Bluetooth</Text>
                        <TouchableOpacity onPress={scan} disabled={scanning}>
                            {scanning ? (
                                <ActivityIndicator color={COLORS.primary} />
                            ) : (
                                <Text style={styles.actionText}>ESCANEAR</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={[...devices.paired, ...devices.found]}
                        keyExtractor={(item) => item.address}
                        renderItem={renderDevice}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No se encontraron dispositivos cercanos</Text>
                        }
                    />
                </View>
            </View>

            {connectedDevice && (
                <TouchableOpacity style={styles.printBtn} onPress={printTest}>
                    <Text style={styles.printBtnText}>IMPRIMIR PRUEBA</Text>
                </TouchableOpacity>
            )}

            <Modal visible={!!currentPdf} animationType="slide">
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Previsualización</Text>
                        <TouchableOpacity onPress={() => setCurrentPdf(null)}>
                            <Text style={styles.closeText}>CERRAR</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.pdfPreview}>
                        <Text style={styles.pdfInfo}>Archivo: {currentPdf?.split('/').pop()}</Text>
                        <Text style={styles.pdfInfo}>Ancho: {paperWidth}mm</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.printBtn, isPrinting && styles.disabledBtn]}
                        onPress={async () => {
                            setIsPrinting(true);
                            // In real implementation: await PdfService.printPdf(currentPdf, paperWidth);
                            await PrinterService.printTest(); // Mock printing for now
                            setIsPrinting(false);
                            setCurrentPdf(null);
                        }}
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <ActivityIndicator color={COLORS.text} />
                        ) : (
                            <Text style={styles.printBtnText}>IMPRIMIR AHORA</Text>
                        )}
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textDim,
        marginTop: 4,
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statusSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    smallBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    activeBtn: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(0, 242, 255, 0.1)',
    },
    btnText: {
        color: COLORS.text,
        fontWeight: '500',
    },
    actionText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    deviceSection: {
        flex: 1,
    },
    deviceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    deviceName: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500',
    },
    deviceAddress: {
        fontSize: 12,
        color: COLORS.textDim,
        marginTop: 2,
    },
    connectedBadge: {
        backgroundColor: 'rgba(0, 255, 100, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    connectedText: {
        color: '#00ff64',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.textDim,
        marginTop: 40,
        fontStyle: 'italic',
    },
    printBtn: {
        margin: 20,
        backgroundColor: COLORS.secondary,
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    printBtnText: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeText: {
        color: COLORS.primary,
    },
    pdfPreview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    pdfInfo: {
        color: COLORS.text,
        fontSize: 16,
        marginBottom: 10,
    },
    disabledBtn: {
        opacity: 0.6,
    },
});

export default App;
