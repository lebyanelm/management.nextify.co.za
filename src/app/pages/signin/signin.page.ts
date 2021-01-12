import { ToastService } from '../../services/toast.service';
import { SocketsService } from '../../services/sockets.service';
import { StorageService } from '../../services/storage.service';
import { timer } from 'rxjs';
import { IonSlides } from '@ionic/angular';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/app/services/loader.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit, AfterViewInit {
  @ViewChild('Slideshow', {static: false}) slideshow: IonSlides;
  @ViewChild('StepsSlideshow', {static: false}) stepSlideshow: IonSlides;
  @ViewChild('Error', {static: false}) error: ElementRef<HTMLDivElement>;
  @ViewChild('VerificationError', {static: false}) verificationError: ElementRef<HTMLDivElement>;
  @ViewChild('FirstCode', {static: false}) firstCode: ElementRef<HTMLInputElement>;
  @ViewChild('SecondCode', {static: false}) secondCode: ElementRef<HTMLInputElement>;
  @ViewChild('ThirdCode', {static: false}) thirdCode: ElementRef<HTMLInputElement>;
  @ViewChild('FourthCode', {static: false}) fourthCode: ElementRef<HTMLInputElement>;
  
  // Boolean values
  isEmailValid = true;
  isLoading = false;

  data = {
    emailAddress: 'lebyane.lm@gmail.com',
    password: 'password2' }
  
  constructor(
    private title: Title,
    private router: Router,
    private loader: LoaderService,
    private storage: StorageService,
    private sockets: SocketsService,
    private toast: ToastService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.title.setTitle('Nextify for Partners | Sign In');
    this.initialiseSlideshow();

    // Set the steps slideshow to be locked to prevent jumping to other steps
    this.stepSlideshow.lockSwipes(true);

    // Setup the keyboard events for verification code input
    this.firstCode.nativeElement.onkeyup = (ev: KeyboardEvent) => {
      const key = parseInt(ev.key);
      if (!isNaN(key)) {
        this.secondCode.nativeElement.disabled = false;
        this.secondCode.nativeElement.focus();
        this.firstCode.nativeElement.disabled = true;
      } else {
        this.firstCode.nativeElement.value = '';
      }
      this.verificationError.nativeElement.innerHTML = '';
    }

    this.secondCode.nativeElement.onkeyup = (ev: KeyboardEvent) => {
      const key = parseInt(ev.key);
      if (!isNaN(key)) {
        this.thirdCode.nativeElement.disabled = false;
        this.thirdCode.nativeElement.focus();
        this.secondCode.nativeElement.disabled = true;
      } else {
        if (ev.key === 'Backspace') {
          this.firstCode.nativeElement.disabled = false;
          this.firstCode.nativeElement.focus();
          this.secondCode.nativeElement.disabled = true;
        } else {
          this.secondCode.nativeElement.value = '';
        }
      }
      this.verificationError.nativeElement.innerHTML = '';
    }
    
    this.thirdCode.nativeElement.onkeyup = (ev: KeyboardEvent) => {
      const key = parseInt(ev.key);
      if (!isNaN(key)) {
        this.fourthCode.nativeElement.disabled = false;
        this.fourthCode.nativeElement.focus();
        this.thirdCode.nativeElement.disabled = true;
      } else {
        if (ev.key === 'Backspace') {
          this.secondCode.nativeElement.disabled = false;
          this.secondCode.nativeElement.focus();
          this.thirdCode.nativeElement.disabled = true;
        } else {
          this.thirdCode.nativeElement.value = '';
        }
      }
      this.verificationError.nativeElement.innerHTML = '';
    }

    this.fourthCode.nativeElement.onkeyup = (ev: KeyboardEvent) => {
      const key = parseInt(ev.key);
      if (!isNaN(key)) {
        this.fourthCode.nativeElement.disabled = true;
        // Send a code verification to the Nextify Partners Backend
        this.verifyCode();
      } else {
        if (ev.key === 'Backspace') {
          this.thirdCode.nativeElement.disabled = false;
          this.thirdCode.nativeElement.focus();
          this.fourthCode.nativeElement.disabled = true;
        } else {
          this.secondCode.nativeElement.value = '';
        }
      }
      this.verificationError.nativeElement.innerHTML = '';
    }
  }

  validateEmailAddress() {
    // REGEX Used to test for valid email addresses
    const emailAddressRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // Use the REGEX to test the email address entered by the user if it is valid or not
    this.isEmailValid = emailAddressRegex.test(this.data.emailAddress);

    // Remove any errors shown
    this.error.nativeElement.innerHTML = '';
  }

  initialiseSlideshow() {
    this.slideshow.lockSwipes(true);
    timer(10000, 10000)
      .subscribe(() => {
        this.slideshow.isEnd()
          .then((isEnd) => {
            this.slideshow.lockSwipes(false);
            if (!isEnd) {
              this.slideshow.slideNext();
            } else {
              this.slideshow.slideTo(0);
            }
            this.slideshow.lockSwipes(true);
          })
      })
  }

  resetVerification(): void {
    // Remove the loader
    this.isLoading = false;

    // Remove the codes entered
    this.firstCode.nativeElement.value = '';
    this.secondCode.nativeElement.value = '';
    this.thirdCode.nativeElement.value = '';
    this.fourthCode.nativeElement.value = '';

    // Remove error messages
    this.error.nativeElement.innerHTML = '';
    this.verificationError.nativeElement.innerHTML = '';

    // Disable the other inputs leaving the first input
    this.firstCode.nativeElement.disabled = false;
    this.secondCode.nativeElement.disabled = true;
    this.thirdCode.nativeElement.disabled = true;
    this.fourthCode.nativeElement.disabled = true;
    
    // Slide the the steps slideshow to the first step
    this.stepSlideshow.lockSwipes(false);
    this.stepSlideshow.slidePrev();
    this.stepSlideshow.lockSwipes(true);
  }

  resetSignInInputs() {
    this.data = {
      emailAddress: '',
      password: ''
    };
  }

  // Sends the data to the nextify backend server to create an account
  signIn(): void {
    // Show loader in the button
    this.isLoading = true;
    this.error.nativeElement.innerHTML = '';

    // Format the authentication data
    const authenticationData = [ 'Basic', btoa([ this.data.emailAddress, this.data.password ].join(':')) ].join(' ');
    console.log(authenticationData);

    // Send the authentication in request
    superagent
      .get([ environment.backendServer, 'auth' ].join('/'))
      .set('Authorization', authenticationData)
      .end((_, response) => {
        this.isLoading = false;
        console.log(response);
        if (response) {
          if (response.status === 200) {
            // If body has no token Two-Factor Authentication is required
            if (response.body.token) {
              this.storage.setItem(environment.PARTNER_DATA_REF, response.body.token, false);
              // Create websockets connection
              this.sockets.createConnection()
                .then((connection) => {
                  // Route the partner to thier dashboard
                  this.router.navigate(['dashboard']);
                }).catch(() => {
                  this.error.nativeElement.innerHTML = 'An error occured while trying to sync with the server. Please try again, if the error persists let us know at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za.</a>'
                })
            } else {
              this.stepSlideshow.lockSwipes(false);
              this.stepSlideshow.slideNext();
              this.stepSlideshow.lockSwipes(true);
            }
          } else if (response.status === 403) {
            this.error.nativeElement.innerHTML = 'Incorrect email address or password. Please check for any mistyped details and try again.';
          } else if (response.status === 404) {
            this.error.nativeElement.innerHTML = 'An account with that email address is not found, please consider <a href="/onboarding">creating an account.</a>';
          } else {
            this.error.nativeElement.innerHTML = 'Something went wrong. Please try again if problem perists contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za.</a>';
          }
        } else {
          this.error.nativeElement.innerHTML = 'No internet connection. Please check your connection.'
        }
      });
  }

  verifyCode(): void {
    this.isLoading = true;
    
    // Send the verification code entered and compare it with the code in the server
    superagent
      .post([environment.backendServer, 'verify'].join('/'))
      .send({
        code: [this.firstCode.nativeElement.value,  this.secondCode.nativeElement.value, this.thirdCode.nativeElement.value, this.fourthCode.nativeElement.value].join(''),
        action: 'verify',
        emailAddress: this.data.emailAddress })
      .end((_, response) => {
        if (response) {
          console.log(response)
          if (response.status === 200) {
            // Save the token recieved for future automatic sign in
            console.log(response.body)
            this.storage.setItem(environment.PARTNER_DATA_REF, response.body.token, false);

            // Create a Socket.IO connection and redirect to dashboard if connection is sucessful
            this.sockets.createConnection()
              .then(() => {
                this.isLoading = false;
                this.router.navigate(['dashboard']);

                // Reset the verification form
                this.resetVerification();

                // Reset the signup form
                this.resetSignInInputs();
              }).catch(() => {
                this.isLoading = false;
                this.toast.show('ERROR: A CONNECTION COULD NOT BE MADE')
              })
          } else if (response.status === 403) {
            this.isLoading = false;
            this.fourthCode.nativeElement.disabled = false;
            this.verificationError.nativeElement.innerHTML = 'Error, code you entered is invalid. Please check for mistyped numbers and try again.'
          } else {
            this.isLoading = false;
            this.fourthCode.nativeElement.disabled = false;
            this.verificationError.nativeElement.innerHTML = 'Something went wrong, please try again. If problem persists contact us.'
          }
        } else {
          this.isLoading = false;
          this.fourthCode.nativeElement.disabled = false;
          this.error.nativeElement.innerHTML = 'No internet connection. Please check your connection.'
        }
      });
  }
}
