# NativeScript Security plugin (w/ TypeScript)

iOS and Android fingerprint scanner for {N} apps.

## Installation

```
tns plugin add nativescript-security
```

## Usage

#### Check for availability

```typescript
import {Security} from 'nativescript-security';

let security = new Security();

let security.available().then(() => {
  
}).catch((error:any)=>{
  console.log(error);
});
```

#### Verify Fingerprint

```typescript
import {Security, FingerprintOptions} from 'nativescript-security';

let options:FingerprintOptions = {
  iOSMessage:'Your message:',
  androidTitle: 'Your title',
  androidMessage: 'Your message'
};

let security = new Security();

let security.verifyFingerPrint(options).then(() => {
  console.log('Verified OK');
}).catch((error) => {
  console.log(error);
});

```

## Future plans
- [ ] Detect if fingerprint has changed android/ios
- [ ] Store secret in android keystore / ios keychain 

## Credits
ios implementation based on [nativescript-touchid](https://github.com/EddyVerbruggen/nativescript-touchid)

android implementation based on [nativescript-android-confirm_credential](https://github.com/tsvetan-ganev/nativescript-android-confirm_credential)
