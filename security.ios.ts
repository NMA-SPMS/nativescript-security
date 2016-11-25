import * as utils from 'utils/utils';

import { FingerprintOptions } from './';

declare var LAContext: any, 
            LAPolicyDeviceOwnerAuthenticationWithBiometrics: any,
            NSString: any,
            NSBundle: any,
            NSMutableDictionary: any,
            NSUTF8StringEncoding: any,
            kSecClassGenericPassword: any,
            kSecClass: any,
            kSecAttrAccount: any,
            kSecAttrService: any,
            kSecUseOperationPrompt: any,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly: any,
            kSecAccessControlUserPresence: any,
            kSecAttrAccessControl: any,
            kSecUseNoAuthenticationUI: any,
            kSecValueData: any,
            SecItemCopyMatching: any, 
            SecAccessControlCreateWithFlags: any,
            SecItemAdd: any,
            kCFAllocatorDefault: any,
            UIDevice: any,
            LNPasscodeStatusDisabled: any;
            
            


export class Security  {

    private keychainItemServiceName: string = null;

    private keychainItemIdentifier: string = "TouchIDKey";

    public available():Promise<any>{
        return new Promise((resolve, reject) => {
            try {
                /*console.log(UIDevice.passcodeStatus);
                if(UIDevice.currentDevice.passcodeStatus == LNPasscodeStatusDisabled){
                    reject('You have no passcode set!');
                } */
                resolve(LAContext.new().canEvaluatePolicyError(
                        LAPolicyDeviceOwnerAuthenticationWithBiometrics, null)
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    public verifyFingerPrint(args:FingerprintOptions):Promise<any>{
        return new Promise((resolve, reject) => {
            try {

                if (this.keychainItemServiceName === null) {
                    let bundleID = utils.ios.getter(NSBundle, NSBundle.mainBundle).infoDictionary.objectForKey("CFBundleIdentifier");
                    this.keychainItemServiceName = bundleID + ".TouchID";
                }

                if (!this.createKeyChainEntry()) {
                    //verifyFingerprintWithCustomFallback(arg).then(resolve, reject);
                    return;
                }
                let message = "Scan your finger";
                if(args && args.iOSMessage ){
                    message = args.iOSMessage;
                }
                
                let query = NSMutableDictionary.new();
                query.setObjectForKey(kSecClassGenericPassword, kSecClass);
                query.setObjectForKey(this.keychainItemIdentifier, kSecAttrAccount);
                query.setObjectForKey(this.keychainItemServiceName, kSecAttrService);
                query.setObjectForKey(message, kSecUseOperationPrompt);

                // Start the query and the fingerprint scan and/or device passcode validation
                let res = SecItemCopyMatching(query, null);
                if (res === 0) { // 0 = ok (match, not canceled)
                    resolve();
                } else {
                    reject(res);
                }

            } catch (ex) {
                console.log("Error in touchid.verifyFingerprint: " + ex);
                reject(ex);
            }
        });
    }

    private createKeyChainEntry() {
        let attributes = NSMutableDictionary.new();
        attributes.setObjectForKey(kSecClassGenericPassword, kSecClass);
        attributes.setObjectForKey(this.keychainItemIdentifier, kSecAttrAccount);
        attributes.setObjectForKey(this.keychainItemServiceName, kSecAttrService);

        let accessControlRef = SecAccessControlCreateWithFlags(
            kCFAllocatorDefault,
            kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
            //kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
            kSecAccessControlUserPresence,
            null
        );
        if (accessControlRef === null) {
            console.log("Can't store identifier '" + this.keychainItemIdentifier + "' in the KeyChain");
            return false;
        } else {
            attributes.setObjectForKey(accessControlRef, kSecAttrAccessControl);
            attributes.setObjectForKey(1, kSecUseNoAuthenticationUI);
            // The content of the password is not important
            let htmlString = NSString.stringWithString("dummy content");
            let nsData = htmlString.dataUsingEncoding(NSUTF8StringEncoding);
            attributes.setObjectForKey(nsData, kSecValueData);

            SecItemAdd(attributes, null);
            return true;
        }
    }
}