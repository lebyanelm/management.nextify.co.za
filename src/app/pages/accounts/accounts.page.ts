import { Partner } from 'src/app/interfaces/Partner';
import { SocketsService } from 'src/app/services/sockets.service';
import { StorageService } from './../../services/storage.service';
import { LoaderService } from './../../services/loader.service';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss'],
})
export class AccountsPage implements AfterViewInit {
  @ViewChild('EmailAddress', {static: false}) emailAddress: ElementRef<HTMLInputElement>;
  @ViewChild('Code', {static: false}) code: ElementRef<HTMLInputElement>;
  @ViewChild('Password', {static: false}) password: ElementRef<HTMLInputElement>;
  @ViewChild('BusinessName', {static: false}) businessName: ElementRef<HTMLInputElement>;
  @ViewChild('NextButton', {static: false}) nextButton: ElementRef<HTMLButtonElement>;
  @ViewChild('SecondaryInstruction', {static: false}) instruction: ElementRef<HTMLButtonElement>;
  @ViewChild('Slides', {static: false}) slides: IonSlides;

  isError = false;
  isSignin = false;
  isTwoFactorAuthentication = false;
  currentFormStep = 0;
  userAvatar: string;

  constructor(
    private loader: LoaderService,
    private router: Router,
    private storage: StorageService,
    private sockets: SocketsService
  ) {
  }

  ngAfterViewInit() {
    // Lock the swipes of the sliders, to prevent unecesary step changes
    this.slides.lockSwipes(true);

    // Firstly let the button click event be a button to submit the email address to check if it exists
    this.nextButton.nativeElement.onclick = () => { this.checkEmailAccount(); };

    this.emailAddress.nativeElement.onkeyup = () => {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (emailRegex.test(this.emailAddress.nativeElement.value)) {
        this.nextButton.nativeElement.disabled = false;
      } else {
        this.nextButton.nativeElement.disabled = true;
      }
    };

    this.password.nativeElement.onkeyup = () => {
      if (this.password.nativeElement.value.length >= 8) {
        this.nextButton.nativeElement.disabled = false;
      } else {
        this.nextButton.nativeElement.disabled = true;
      }
    };

    this.code.nativeElement.onkeyup = () => {
      if (this.code.nativeElement.value.length === 6) {
        this.nextButton.nativeElement.disabled = false;
      } else {
        this.nextButton.nativeElement.disabled = true;
      }
    };

    this.businessName.nativeElement.onkeyup = () => {
      if (this.businessName.nativeElement.value.length !== 0) {
        this.nextButton.nativeElement.disabled = false;
      } else {
        this.nextButton.nativeElement.disabled = true;
      }
    };
  }

  checkEmailAccount() {
    this.nextButton.nativeElement.disabled = true;
    this.loader.showLoader(true);
    superagent
      .post(environment.backendServer + '/')
      .send({emailAddress: this.emailAddress.nativeElement.value.toLowerCase()})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        this.loader.showLoader(false);
        if (response) {
          console.log(response.status)
          if (response.status === 201 || response.status === 208) {
            this.currentFormStep = 1;
            this.instruction.nativeElement.innerHTML = 'An email has been sent to your email address, enter the code above.';
            this.slideNextStep();
            this.nextButton.nativeElement.onclick = () => { this.verifyEmailAddress(); };
          } else if (response.status === 302) {
            if (response.body.isTwoFactorAuthentication) {
              this.currentFormStep = 1;
              this.isTwoFactorAuthentication = true;
              this.userAvatar = response.body.avatar;
              this.instruction.nativeElement.innerHTML = 'An email has been sent to your email address, enter the code above.';
              this.nextButton.nativeElement.onclick = () => { this.verifyEmailAddress(); };
          } else {
              this.instruction.nativeElement.innerHTML = 'Welcome back, we\'ve missed you.';
              this.currentFormStep = 2;
              this.nextButton.nativeElement.onclick = () => { this.signin(); };
            }

            this.userAvatar = response.body.avatar;
            this.slideNextStep();
          }
        }
      });
  }

  verifyEmailAddress() {
    this.nextButton.nativeElement.disabled = true;
    this.loader.showLoader(true);
    const code = this.code.nativeElement.value;
    superagent
      .post(environment.backendServer + '/verify')
      .send({code, emailAddress: this.emailAddress.nativeElement.value, action: this.isTwoFactorAuthentication ? 'reset' : 'signup'})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            this.loader.showLoader(false);
            this.isError = false;
            this.currentFormStep = 2;
            this.storage.setItem(environment.PARTNER_DATA_REF, response.body.token, false);
            this.slideNextStep();

            // Also accomodate the two factor authentication system
            if (this.isTwoFactorAuthentication) {
              this.nextButton.nativeElement.onclick = () => { this.signin(); };
            } else {
              this.nextButton.nativeElement.onclick = () => { this.collectPassword(); };
            }
          } else if (response.status === 403) {
            this.loader.showLoader(false);
            this.isError = true;
            this.instruction.nativeElement.innerHTML = 'The code you entered is incorrect, please check for any mistakes and try again.';
          }
        }
      });
  }

  collectPassword() {
    this.nextButton.nativeElement.disabled = true;
    this.currentFormStep = 3;
    this.slideNextStep();
    this.nextButton.nativeElement.children[0].innerHTML = 'Finish';
    this.nextButton.nativeElement.onclick = () => { this.finishPartnerSignup(); };
  }

  finishPartnerSignup() {
    this.nextButton.nativeElement.disabled = true;
    this.loader.showLoader(true);
    superagent
      .post(environment.backendServer + '/finish-signup')
      .on('progress', (event) => this.loader.pipe(event.percent))
      // tslint:disable-next-line: max-line-length
      .send({emailAddress: this.emailAddress.nativeElement.value, password: this.password.nativeElement.value, businessName: this.businessName.nativeElement.value})
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            this.loader.showLoader(false);
            this.sockets.restartConnection();
            this.router.navigate(['home'], {queryParams: { isNew: true }});
          } else if (response.status === 403) {
            this.loader.showLoader(false);
            this.nextButton.nativeElement.disabled = false;
          }
        }
      });
  }

  signin() {
    this.nextButton.nativeElement.disabled = true;
    this.loader.showLoader(true);
    superagent
      .get(environment.backendServer + '/auth')
      .auth(this.emailAddress.nativeElement.value, this.password.nativeElement.value, {type: 'basic'})
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            this.loader.showLoader(false);
            this.storage.setItem(environment.PARTNER_DATA_REF, response.body.token, false);

            // If any more branches exist refer the page to a different page
            this.sockets.createConnection()
              .then((data: Partner) => {
                if (data) {
                  this.router.navigate(['home']);
                }
              });
          } else if (response.status === 403) {
            this.isError = true;
            this.instruction.nativeElement.innerHTML = 'The password you\'ve entered is incorrect, check for mistakes and try again.';
          }
        } else {
          this.isError = true;
          this.instruction.nativeElement.innerHTML = 'No internet connection, check your internet connection and try again.';
        }
      });
  }

  slideNextStep() {
    this.slides.lockSwipes(false);
    this.slides.slideTo(this.currentFormStep);
    this.slides.lockSwipes(true);
  }
}
