import { Component, OnInit, Input, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { IonCheckbox } from '@ionic/angular';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss'],
})
export class SettingComponent implements AfterViewInit {
  @Input() name: string;
  @Input() description: string;
  @Input() isChecked: boolean;

  @ViewChild('Checkbox', {static: false}) checkbox: IonCheckbox;
  @ViewChild('SettingDetails', {static: false}) settingDetails: ElementRef<HTMLDivElement>;
  constructor() { }

  ngAfterViewInit() {
    this.settingDetails.nativeElement.addEventListener('click', () => {
      this.isChecked = !this.isChecked;
    });
  }
}
