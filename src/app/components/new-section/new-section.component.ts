import { SettingComponent } from './../setting/setting.component';
import { Section } from './../../interfaces/Section';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-new-section',
  templateUrl: './new-section.component.html',
  styleUrls: ['./new-section.component.scss'],
})
export class NewSectionComponent implements OnInit {
  @ViewChild('IsRequiredSetting', { static: false }) isRequired: SettingComponent;
  @Input() data: Section;
  options: string[] = [];
  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    if (this.data) {
      this.options = [...this.data.options];
    }
  }

  addOption(value: string): void {
    if (value) {
      this.options.push(value);
    }
  }

  removeOption(value: string): void {
    const index = this.options.indexOf(value);
    if (index !== -1) {
      this.options.splice(index, 1);
    }
  }

  exportOptions(name: string): void {
    this.modalCtrl.dismiss({ name, options: this.options, isRequired: this.isRequired.isChecked });
  }
}
