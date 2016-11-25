import * as app from 'application';
import { ad } from 'utils/utils';
import { FingerprintOptions } from './';

declare var android: any, 
        java: any, 
        javax: any,
        KeyguardManager: any,
        ActivityCompat: any,
        Manifest: any ,
        PackageManager: any,
        KeyStore: any,
        Cipher: any,
        KeyGenerator: any,
        KeyProperties: any,
        SecretKey: any,
        KeyGenParameterSpec: any;

export class Security  {

    KEY_NAME = 'nativescript-security';
    SECRET_BYTE_ARRAY = (Array as any).create('byte', 16);
    REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS = 1;
    AUTHENTICATION_DURATION = 15; // in seconds
    title = 'Please confirm your credentials.';
    message = 'We are doing this for your own security.';

    KeyguardManager = android.app.KeyguardManager;
    ActivityCompat = android.support.v4.app.ActivityCompat;
    Manifest = android.Manifest;
    PackageManager = android.content.pm.PackageManager;
    KeyStore = java.security.KeyStore;
    Cipher = javax.crypto.Cipher;
    KeyGenerator = javax.crypto.KeyGenerator;
    KeyProperties = android.security.keystore.KeyProperties;
    SecretKey = javax.crypto.SecretKey;
    KeyGenParameterSpec = android.security.keystore.KeyGenParameterSpec;

    public available():Promise<any>{
        return new Promise((resolve, reject) => {
            try {

                let keyguardManager = ad.getApplicationContext().getSystemService("keyguard");

                if (!keyguardManager.isKeyguardSecure()) { 
                    resolve(false);
                    return;
                }

                // Check if we're running on Android 6.0 (M) or higher
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    //Fingerprint API only available on from Android 6.0 (M)
                    let fingerprintManager = ad.getApplicationContext().getSystemService("fingerprint");
                    if (!fingerprintManager.isHardwareDetected()) { 
                        // Device doesn't support fingerprint authentication
                        reject('Device doesn\'t support fingerprint authentication');     
                    } else if (!fingerprintManager.hasEnrolledFingerprints()) { 
                        // User hasn't enrolled any fingerprints to authenticate with 
                        reject('User hasn\'t enrolled any fingerprints to authenticate with ');    
                    } else { 
                        resolve(true);
                    }
                }
                
            } catch (error) {
                reject(error);
            }
        });
    }

    public verifyFingerPrint(args: FingerprintOptions):Promise<any>{
        return new Promise(function (resolve, reject) {
            let activity = app.android.foregroundActivity;
            try {
                activity.onActivityResult = function onActivityResult(requestCode, resultCode, data) {
                    if (requestCode === this.REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS) {
                        if (resultCode === android.app.Activity.RESULT_OK) {
                            // the user has just authenticated via the ConfirmDeviceCredential activity
                            resolve('Congrats! You have just been authenticated successfully!');
                        } else {
                            // the user has quit the activity without providing credentials
                            reject('The last authentication attempt was cancelled.');
                        }
                    }
                };
                let keyguardManager = ad.getApplicationContext().getSystemService("keyguard");

                if (keyguardManager == null) {
                    reject('Sorry, your device does not support keyguardManager.');
                }
                if (keyguardManager && !keyguardManager.isKeyguardSecure()) {
                    reject('Secure lock screen hasn\'t been set up.\n Go to "Settings -> Security -> Screenlock" to set up a lock screen.');
                }

                this.createKey();
                this.tryEncrypt(); 
            
            } catch (ex) {
                console.log("Error in verifyFingerprint: " + ex);
                reject(ex);
            }
        });
    }

    private createKey() {
        try {
            var keyStore = this.KeyStore.getInstance('AndroidKeyStore');
            keyStore.load(null);
            var keyGenerator = this.KeyGenerator.getInstance(this.KeyProperties.KEY_ALGORITHM_AES, 'AndroidKeyStore');

            keyGenerator.init(
            new this.KeyGenParameterSpec.Builder(this.KEY_NAME, this.KeyProperties.PURPOSE_ENCRYPT | this.KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes([this.KeyProperties.BLOCK_MODE_CBC])
                .setUserAuthenticationRequired(true)
                .setUserAuthenticationValidityDurationSeconds(this.AUTHENTICATION_DURATION)
                .setEncryptionPaddings([this.KeyProperties.ENCRYPTION_PADDING_PKCS7])
                .build()
            );
            keyGenerator.generateKey();
        } catch (error) {
            // checks if the AES algorithm is implemented by the AndroidKeyStore
            if ((error.nativeException + '').indexOf('java.security.NoSuchAlgorithmException:') > -1) {
            //You need a device with API level >= 23 in order to detect if the user has already been authenticated in the last x seconds.
            }
            console.log(error);
        }
    }

    private tryEncrypt() {
        try {
            let keyStore = this.KeyStore.getInstance('AndroidKeyStore');
            keyStore.load(null);
            let secretKey = keyStore.getKey(this.KEY_NAME, null);

            let cipher = this.Cipher.getInstance(this.KeyProperties.KEY_ALGORITHM_AES + "/" +
                                            this.KeyProperties.BLOCK_MODE_CBC + "/" +
                                            this.KeyProperties.ENCRYPTION_PADDING_PKCS7);

            cipher.init(this.Cipher.ENCRYPT_MODE, secretKey);
            cipher.doFinal(this.SECRET_BYTE_ARRAY);
            
            return true;
        } catch (error) {
            if ((error.nativeException + '').indexOf('android.security.keystore.UserNotAuthenticatedException') > -1) {
                // the user must provide their credentials in order to proceed
                this.showAuthenticationScreen();
            } else if((error.nativeException + '').indexOf('android.security.keystore.KeyPermanentlyInvalidatedException') > -1){
                //Invalid fingerprint
                console.log(error);
            } else {
                console.log(error);
            }

            return false;
        }
    }

    private showAuthenticationScreen() {
        // title and description are optional, if you want the defaults,
        // you must pass nulls to the factory function
        let keyguardManager = ad.getApplicationContext().getSystemService("keyguard");
        let intent = keyguardManager.createConfirmDeviceCredentialIntent(this.title, this.message);
        let activity = app.android.foregroundActivity;
        if (intent != null) {
            activity.startActivityForResult(intent, this.REQUEST_CODE_CONFIRM_DEVICE_CREDENTIALS);
        }
    }
}