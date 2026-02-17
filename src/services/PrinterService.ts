import { BluetoothManager, BluetoothEscposPrinter } from '@brooons/react-native-bluetooth-escpos-printer';

export class PrinterService {
    static async scanDevices() {
        try {
            const devices = await BluetoothManager.scanDevices();
            return JSON.parse(devices); // returns {found: [], paired: []}
        } catch (e) {
            console.error(e);
            return { found: [], paired: [] };
        }
    }

    static async connect(address) {
        try {
            await BluetoothManager.connect(address);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    static async printTest() {
        try {
            await BluetoothEscposPrinter.printerInit();
            await BluetoothEscposPrinter.printerLeftSpace(0);
            await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
            await BluetoothEscposPrinter.printText("Gestro Print Test\n", {
                encoding: 'GBK',
                codepage: 0,
                widthtimes: 1,
                heigthtimes: 1,
                fonttype: 0
            });
            await BluetoothEscposPrinter.printText("--------------------------------\n", {});
            await BluetoothEscposPrinter.printText("Ready to Print PDFs!\n", {});
            await BluetoothEscposPrinter.printText("\n\n\n", {});
        } catch (e) {
            console.error(e);
        }
    }

    static async printImage(base64, width = 384) {
        try {
            await BluetoothEscposPrinter.printPic(base64, { width });
        } catch (e) {
            console.error(e);
        }
    }
}
