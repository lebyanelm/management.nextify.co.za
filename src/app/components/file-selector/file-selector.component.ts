import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-selector',
  templateUrl: './file-selector.component.html',
  styleUrls: ['./file-selector.component.scss'],
})
export class FileSelectorComponent implements AfterViewInit {
  @ViewChild('Input', {static: false}) input: ElementRef<HTMLInputElement>;
  @Input() placeholder: string;
  @Input() name: string;

  file: File;
  errorCode = 0;
  disabled = false;
  progress = 0;
  // tslint:disable-next-line: variable-name
  @Output() _change: EventEmitter<File> = new EventEmitter<File>();

  constructor() {}
  ngAfterViewInit() {
    this.input.nativeElement.onchange = () => {
      this.file = this.input.nativeElement.files[0];
      this._change.emit();
    };
  }
  openFileSelector() {
    if (!this.disabled) {
      this.input.nativeElement.click();
    }
  }

  setErrorCode(code?: number) {
    this.errorCode = code || 0;
  }

  reset() {
    this.file = null;
    this.input.nativeElement.value = null;
  }
}
