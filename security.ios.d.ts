import { FingerprintOptions } from './';
export declare class Security {
    private keychainItemServiceName;
    private keychainItemIdentifier;
    available(): Promise<any>;
    verifyFingerPrint(args: FingerprintOptions): Promise<any>;
    private createKeyChainEntry();
}
