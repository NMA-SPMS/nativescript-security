import { FingerprintOptions } from './';
export declare class Security {
    KEY_NAME: string;
    SECRET_BYTE_ARRAY: any;
    REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS: number;
    AUTHENTICATION_DURATION: number;
    title: string;
    message: string;
    KeyguardManager: any;
    ActivityCompat: any;
    Manifest: any;
    PackageManager: any;
    KeyStore: any;
    Cipher: any;
    KeyGenerator: any;
    KeyProperties: any;
    SecretKey: any;
    KeyGenParameterSpec: any;
    available(): Promise<any>;
    verifyFingerPrint(args: FingerprintOptions): Promise<any>;
    private createKey();
    private tryEncrypt();
    private showAuthenticationScreen();
}
