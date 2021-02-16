import { ToastService } from './../../services/toast.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
})
export class ToastComponent implements OnInit {
  @Input() message: string;
  @Input() button: { text: string, handler: () => void };
  @Input() index: number;
  constructor(
    public toastService: ToastService
  ) { }

  ngOnInit() {}
}
