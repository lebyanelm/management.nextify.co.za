import { Component, ViewChild, Input } from '@angular/core';
import { IonRange } from '@ionic/angular';

@Component({
  selector: 'float-range',
  template: `
      <ion-range #range [min]="min" [max]="max" [pin]="pin" [step]="step" [snaps]="snaps"></ion-range>
      `
})
export class FloatRangeComponent {

  @Input() max: number;
  @Input() min: number;
  @Input() pin: boolean;
  @Input() step: number;
  @Input() snaps: boolean;

  @ViewChild('range', {static: false})
  set range(range) {
    const floatRange: FloatRangeComponent = this;
    range.ratioToValue = function(ratio: number) {
      this._step = Math.round(floatRange.step * 100) / 100;
      ratio = (this._max - this._min) * ratio;
      ratio = (ratio / this._step) * this._step + this._min;
      return Math.round(ratio * ( 1 / this._step)) / ( 1 / this._step);
    };
  }
}
