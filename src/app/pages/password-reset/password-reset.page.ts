import { ToastService } from "../../services/toast.service";
import { SocketsService } from "../../services/sockets.service";
import { StorageService } from "../../services/storage.service";
import { timer } from "rxjs";
import { IonSlides } from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from "@angular/core";
import { Title } from "@angular/platform-browser";
import * as superagent from "superagent";
import { environment } from "src/environments/environment";
import { Router, ActivatedRoute } from "@angular/router";
import { LoaderService } from "src/app/services/loader.service";

@Component({
  selector: "app-password-reset",
  templateUrl: "./password-reset.page.html",
  styleUrls: ["./password-reset.page.scss"],
})
export class PasswordResetPage implements OnInit, AfterViewInit {
  @ViewChild("Slideshow", { static: false }) slideshow: IonSlides;
  @ViewChild("StepsSlideshow", { static: false }) stepSlideshow: IonSlides;
  @ViewChild("Error", { static: false }) error: ElementRef<HTMLDivElement>;
  @ViewChild("PasswordResetError", { static: false })
  passwordResetError: ElementRef<HTMLDivElement>;

  // Boolean values
  isEmailValid = false;
  isLoading = false;
  isPasswordResetSent = false;
  isPasswordReset = false;
  resetToken = null;
  partnerId = null;
  passwordResetId = null;

  data = {
    emailAddress: "",
    firstPassword: "",
    secondPassword: "",
  };

  constructor(
    private title: Title,
    private router: Router,
    private loader: LoaderService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const passwordResetId = params.get("resetId"),
        partnerId = params.get("partnerId");

      this.partnerId = partnerId;

      // Send a request to revoke the password reset link and check if it's valid
      if (passwordResetId && partnerId) {
        this.isLoading = true;
        superagent
          .post([environment.backendServer, "verify-reset-password"].join("/"))
          .send({ passwordResetId, partnerId })
          .end((_, response) => {
            this.isLoading = false;
            if (response) {
              if (response.status === 200) {
                this.stepSlideshow.lockSwipes(false);
                this.stepSlideshow.slideNext();
                this.stepSlideshow.lockSwipes(true);
                this.resetToken = response.body.resetToken;
              } else {
                this.error.nativeElement.innerHTML =
                  response.body.reason ||
                  "Your password reset ID could not be authenticated. Please try again.";
              }
            } else {
              this.error.nativeElement.innerHTML =
                "No internet connection. Please check your network and try again.";
            }
          });
      }
    });
  }

  ngAfterViewInit() {
    this.title.setTitle("Nextify for Partners | Password Reset");
    this.initialiseSlideshow();

    // Set the steps slideshow to be locked to prevent jumping to other steps
    this.stepSlideshow.lockSwipes(true);
    this.loader.showLoader(false);
  }

  initialiseSlideshow() {
    this.slideshow.lockSwipes(true);
    timer(10000, 10000).subscribe(() => {
      this.slideshow.isEnd().then((isEnd) => {
        this.slideshow.lockSwipes(false);
        if (!isEnd) {
          this.slideshow.slideNext();
        } else {
          this.slideshow.slideTo(0);
        }
        this.slideshow.lockSwipes(true);
      });
    });
  }

  validateEmailAddress() {
    // REGEX Used to test for valid email addresses
    const emailAddressRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    // Use the REGEX to test the email address entered by the user if it is valid or not
    this.isEmailValid = emailAddressRegex.test(this.data.emailAddress);

    // Remove any errors shown
    this.error.nativeElement.innerHTML = "";
  }

  resetVerification(): void {
    // Remove the loader
    this.isLoading = false;

    // Remove error messages
    this.error.nativeElement.innerHTML = "";
    this.passwordResetError.nativeElement.innerHTML = "";

    // Slide the the steps slideshow to the first step
    this.stepSlideshow.lockSwipes(false);
    this.stepSlideshow.slidePrev();
    this.stepSlideshow.lockSwipes(true);
  }

  resetSignInInputs() {
    this.data = {
      emailAddress: "",
      firstPassword: "",
      secondPassword: "",
    };
  }

  // Sends the data to the nextify backend server to create an account
  requestPasswordReset(): void {
    // Show loader in the button
    this.isLoading = true;

    superagent
      .get(
        [
          environment.backendServer,
          "reset-password?emailAddress=" + this.data.emailAddress,
        ].join("/")
      )
      .end((_, response) => {
        this.isLoading = false;
        if (response) {
          if (response.status === 200 || response.status === 404) {
            this.isPasswordResetSent = true;
            console.log(this.data.emailAddress);
          } else if (response.status === 400) {
            this.error.nativeElement.innerHTML =
              'Invalid Request. Request sent was invalid please contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za</a> to let us know.';
          } else {
            this.error.nativeElement.innerHTML =
              'Something went wrong. Please try again if problem persists contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za.</a>';
          }
        } else {
          this.error.nativeElement.innerHTML =
            "No internet connection. Please check your network and try again.";
        }
      });
  }

  resetPassword(): void {
    this.isLoading = true;
    this.passwordResetError.nativeElement.innerHTML = "";

    superagent
      .post([environment.backendServer, "reset-password"].join("/"))
      .send({
        resetToken: this.resetToken,
        partnerId: this.partnerId,
        password: this.data.firstPassword,
      })
      .end((_, response) => {
        this.isLoading = false;
        if (response) {
          if (response.status === 200) {
            this.isPasswordReset = true;
          } else if (response.status === 404) {
            this.error.nativeElement.innerHTML =
              'Account no longer exists. Please contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za</a> if this is a fault.';
          } else if (response.status === 400) {
            this.error.nativeElement.innerHTML =
              'Invalid Request. Request sent was invalid please contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za</a> to let us know.';
          } else {
            this.error.nativeElement.innerHTML =
              'Something went wrong. Please try again if problem persists contact us at <a href="mailto:helpdesk@nextify.co.za">helpdesk@nextify.co.za.</a>';
          }
        } else {
          this.error.nativeElement.innerHTML =
            "No internet connection. Please check your network and try again.";
        }
      });
  }
}
