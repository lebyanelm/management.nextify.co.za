import { Subject } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnInit {
  @Input() options: any[];
  @Input() title: string;

  isItemsEnabled = false;

  constructor() { }

  ngOnInit() {}

  handler(handler: any, passed: any, self: any): void {
    handler(passed, self);
    this.toggleDropdownItems();
  }

  toggleDropdownItems() {
    this.isItemsEnabled = !this.isItemsEnabled;
  }

  mouseleave() {
    console.log('Mouse Left:', this.isItemsEnabled);
    if (this.isItemsEnabled) {
      this.toggleDropdownItems();
    }
  }
}
