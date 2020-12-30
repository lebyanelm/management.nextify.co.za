import { SectionOption } from './../../interfaces/SectionOption';
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
  options: SectionOption[] = [];
  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    if (this.data) {
      this.options = [...this.data.options];
    }
  }

  addOption(value: string, price: string = null): void {
    if (value) {
      this.options.push({ name: value, price: price});
    }
  }

  removeOption(value: string): void {
    const index = this.options.findIndex((o) => o.name === value);
    if (index !== -1) {
      this.options.splice(index, 1);
    }
  }

  exportOptions(name: string): void {
    this.modalCtrl.dismiss({ name, options: this.options, isRequired: this.isRequired.isChecked });
  }
}
