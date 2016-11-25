import {Observable} from 'data/observable';
import {Security, FingerprintOptions} from 'nativescript-security';

export class HelloWorldModel extends Observable {
  public message: string;
  private security: Security;

  constructor() {
    super();

    this.security = new Security();

    this.security.available().then((value:any) => {
      console.log(value);
      this.security.verifyFingerPrint({
        iOSMessage:'Your message:',
        androidTitle: 'Your title',
        androidMessage: 'Your message'
      }).then(() => {
        console.log('Verified OK');
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error:any)=>{
      console.log(error);
    });

    
    
  }
}