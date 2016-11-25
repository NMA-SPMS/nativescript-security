

export declare class Security {

    /**
     * Verifies if fingerprint auth is available
     */
    available(): Promise<any>;

    /**
     * FingerPrint auth
     */
    verifyFingerPrint(args:FingerprintOptions): Promise<any>;

}

export interface FingerprintOptions{
    iOSMessage: string;
    androidMessage: string;
    androidTitle: string;
}