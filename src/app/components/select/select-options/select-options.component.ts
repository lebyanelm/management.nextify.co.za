import { Extra } from './../../../interfaces/Extra';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-options',
  templateUrl: './select-options.component.html',
  styleUrls: ['./select-options.component.scss'],
})
export class SelectOptionsComponent implements OnInit {
  @Input() options: Extra[];
  @Input() exclude: string[] | any[];
  @Input() currentlySelected: Extra[];
  @Input() okText: string;
  @Input() title: string;
  @Input() multiSelect: boolean;
  @Input() onChange: EventEmitter<any[] | any>;

  selectedValues: Extra[] = [];

  constructor(private modalCtrl: ModalController) {
    if (!this.currentlySelected) {
      this.currentlySelected = [];
    }

    if (this.multiSelect === undefined) {
      this.multiSelect = true;
    }
  }

  ngOnInit() {
    this.selectedValues.push(...this.currentlySelected);
  }

  selectOption(optionValue) {
    if (this.multiSelect) {
      if (this.selectedValues.indexOf(optionValue) !== -1) {
        this.selectedValues.splice(this.selectedValues.indexOf(optionValue), 1);
      } else {
        this.selectedValues.push(optionValue);
      }
    } else {
      this.selectedValues = [optionValue];
    }
  }

  setOptions() {
    this.modalCtrl.dismiss(this.selectedValues);
  }

  parseFloat(value) {
    return parseFloat(value);
  }
}
