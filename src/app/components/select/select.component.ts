import { Extra } from './../../interfaces/Extra';
import { SelectOptionsComponent } from './select-options/select-options.component';
import { ModalController } from '@ionic/angular';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
})
export class SelectComponent implements AfterViewInit {
  @ViewChild('Select', {static: false}) selectContainer: ElementRef<HTMLDivElement>;
  @Input() options: any[] | any;
  @Input() placeholder: string;
  @Input() okText: string;
  @Input() header: string;
  @Input() selected: any[];
  @Input() isMultiSelect: boolean;
  @Input() runBeforeOnClick: { handler: () => () => void, self: any };
  @Output() changes: EventEmitter<any> = new EventEmitter();

  constructor(private modalCtrl: ModalController) {
    if (!this.selected) {
      this.selected = [];
    }

    if (this.isMultiSelect === undefined) {
      this.isMultiSelect = false;
    }
  }

  ngAfterViewInit() {
    this.selectContainer.nativeElement.onclick = async () => {
      this.open();
    };
  }

  async initializeSelect() {
    const selectOptionsModal = await this.modalCtrl.create({
      component: SelectOptionsComponent,
      cssClass: ['select-options-modal', 'modal'],
      componentProps: { options: this.options,
          currentlySelected: this.selected,
          title: this.header,
          multiSelect: this.isMultiSelect,
          onChange: this.changes,
          okText: this.okText }
    });

    selectOptionsModal.onDidDismiss()
      .then((data) => {
        if (data.data) {
          this.selected = data.data;
          this.changes.emit(this.selected);
        }
      });

    selectOptionsModal.present();
  }

  async open() {
    if (this.runBeforeOnClick && this.runBeforeOnClick.handler) {
      this.options = await this.runBeforeOnClick.handler.bind(this.runBeforeOnClick.self)();
    }

    this.initializeSelect();
  }
}
