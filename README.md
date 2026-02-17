# Instrucciones de Construcción - Gestro Print

Esta aplicación ha sido diseñada para ser compilada como un APK independiente (sin Play Store).

## Requisitos Previos

1.  **Node.js** (v18 o superior).
2.  **Java Development Kit (JDK) 17**.
3.  **Android SDK** (instalado vía Android Studio).

## Pasos para Compilar

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Preparar el entorno de Android**:
    Asegúrate de tener un archivo `debug.keystore` en `android/app/`. Si no lo tienes, puedes generarlo con:
    ```bash
    keytool -genkey -v -keystore android/app/debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
    ```

3.  **Compilar el APK de lanzamiento (Release)**:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```

4.  **Localizar el APK**:
    El archivo generado estará en:
    `android/app/build/outputs/apk/release/app-release.apk`

## Cómo usar la App

1.  **Instalar**: Envía el archivo `app-release.apk` a tu teléfono e instálalo.
2.  **Configurar**: Abre la app y concede permisos de Bluetooth.
3.  **Vincular**: Selecciona tu impresora de la lista para guardarla como predeterminada.
4.  **Imprimir**: Ve a tu página web, genera el PDF, dale a "Compartir" y selecciona "Gestro Print".
