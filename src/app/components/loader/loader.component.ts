import { LoaderService } from './../../services/loader.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent implements OnInit {
  progress: number;
  constructor(
    private loader: LoaderService
  ) { }

  ngOnInit() {
    this.loader.progress.subscribe((progress) => {
      this.progress = progress;
      console.log(this.progress)
    });
  }

}
