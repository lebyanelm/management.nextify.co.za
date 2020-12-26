import { LoaderService } from './../../services/loader.service';
import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { timer } from 'rxjs';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss'],
})
export class ImageViewComponent implements AfterViewInit {
  @ViewChild('Slideshow', {static: false}) slideshow;

  @Input() images: string[];
  @Input() productDescription: string;
  @Input() id: string;
  index = 0;
  currentImage;

  constructor(
    private loader: LoaderService
  ) { }

  ngAfterViewInit() {
    this.currentImage = this.images[this.index];
    this.loader.showLoader(false);
    this.slideshow.onIndexChanged.subscribe((index) => {
      this.index = index;
      this.currentImage = this.images[this.index];
    });
  }
}
