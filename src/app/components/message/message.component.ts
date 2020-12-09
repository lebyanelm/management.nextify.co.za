import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})
export class MessageComponent implements OnInit {
  @Input() id: string;
  @Input() message: string;
  @Input() type: string;
  @Input() attachments: string[];
  @Input() reply: any;
  @Input() timeCreated: any;
  @Input() state: any;
  @Input() isShowTime: boolean;
  @Input() isNewDay: boolean;
  @Input() isNewOrder: boolean;
  constructor() {
    if (this.isShowTime === undefined) {
      this.isShowTime = true;
    }
  }

  ngOnInit() {}

}
