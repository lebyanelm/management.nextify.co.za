import { ToastService } from 'src/app/services/toast.service';
import { StorageService } from './services/storage.service';
import { LoaderService } from './services/loader.service';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { SocketsService } from './services/sockets.service';
import { Router, ActivatedRoute } from '@angular/router';
import { timer } from 'rxjs';
import { NotificationService } from './services/notification.service';
import { ToastMessage } from './interfaces/ToastMessage';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  @ViewChild('AudioRoute', {static: false}) audio: ElementRef<HTMLAudioElement>;

  isLoaderComplete = false;
  isLoading = true;
  isLoaderAlreadyShown = false;
  isSecondaryLoading = false;
  isModalLoading = false;
  toastMessages = [];

  constructor(
    private platform: Platform,
    public loader: LoaderService,
    private toastService: ToastService,
    private router: Router,
    private notifications: NotificationService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Check if the device viewing the page is a mobile device or a normal tablat or laptop
      if (this.platform.width() >= 1030) {

        // Listen for loader state changes
        this.loader.state.subscribe((s) => {
          if (!s.state) {
            if (!s.isModal) {
              // Delay the change to the next 500 milliseconds for the animation to finish
              this.isLoaderComplete = !s.state;
              timer(500)
                .subscribe(() => {
                  if (this.isLoaderAlreadyShown)
                    this.isSecondaryLoading = s.state;
                  else 
                    this.isLoading = s.state;
                    this.isLoaderAlreadyShown = true;
                  this.isLoaderComplete = false;
                });
            } else {
              // Delay the change to the next 500 milliseconds for the animation to finish
              this.isLoaderComplete = !s.state;
              timer(500)
                .subscribe(() => { this.isModalLoading = s.state; this.isLoaderComplete = false; });
            }
          } else {
            if (!s.isModal) {
              // The primary loader only shows up when app initialises, other loads blur the screen
              if (this.isLoaderAlreadyShown) {
                this.isSecondaryLoading = s.state;
              } else {
                this.isLoading = true;
              }
            } else {
              this.isModalLoading = s.state;
            }
          }
        });
  
        // Register notifications listner
        this.notifications.state.subscribe((count) => {
          const tones = [ 'order.wav', 'message.mp3' ];
          this.audio.nativeElement.onloadeddata = () => {
            this.audio.nativeElement.play();
          };
          this.audio.nativeElement.src = ['/assets/sounds', tones[count]].join('/');
        });

        // Register toast message updates
        this.toastService.onToastMessage.subscribe((toastMessage) => {
          const index = this.toastMessages.push({ ...toastMessage.toastMessage, index: this.toastMessages.length });
          toastMessage.callback(index - 1);
          if (toastMessage.toastMessage.timeout !== 0) {
            timer(toastMessage.toastMessage.timeout)
              .subscribe(() => {
                this.toastMessages.splice(index - 1, 1);
              });
          }
        });

        this.toastService.onToastRemove.subscribe((index: number) => {
          console.log(this.toastMessages)
          if (this.toastMessages[index]) {
            this.toastMessages.splice(index, 1);

            // Update the other remaining up toasts
            console.log(index)
            for (let i = index; i < this.toastMessages.length; i++) {
              this.toastMessages[i].index -= 1;
            }
          }
        });
      } else {
        // Navigate the user to a page showing them the device is not supported
        this.router.navigate(['device-not-supported-yet']);
      }
    });
  }
}
