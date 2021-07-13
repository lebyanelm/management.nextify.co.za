import { ModalController } from '@ionic/angular';
import { LoaderService } from './../../services/loader.service';
import { StatusService } from './../../services/status.service';
import { ToastService } from './../../services/toast.service';
import { FileSelectorComponent } from './../file-selector/file-selector.component';
import { environment } from './../../../environments/environment';
import { BranchService } from './../../services/branch.service';
import { SocketsService } from './../../services/sockets.service';
import { SelectComponent } from './../select/select.component';
import { CustomersService } from './../../services/customers.service';
import { Message } from './../../interfaces/Message';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { timer } from 'rxjs';
import { Customer } from 'src/app/interfaces/Customer';
import * as scrollIntroView from 'scroll-into-view';
import * as superagent from 'superagent';
import { ImageViewComponent } from '../image-view/image-view.component';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('FileSelect', {static: false}) fileSelect: FileSelectorComponent;
  @ViewChild('CustomersSelector', {static: false}) customersSelector: SelectComponent;
  @ViewChild('ChatMessages', {static: false}) chatMessages: ElementRef<HTMLElement>;
  isChatOpen = false;
  isMessagesOpen = false;
  isMessageOpenTemp = false;
  isNewChat = false;
  isReplying;
  recipientList = [];
  recipientDetails = {};
  activeCustomerId: string;
  message: any = { body: '', type: 'outbound' };
  isUpload = true;
  progress = 0;
  public noTotalUnreadMessages = 0;
  public searchKeyword = '';
  public searchedCustomers = [];

  constructor(
    public customersService: CustomersService,
    public sockets: SocketsService,
    public branchService: BranchService,
    private toast: ToastService,
    private loader: LoaderService,
    public status: StatusService,
    private modalCtrl: ModalController
  ) {

    // Wait for the data to be available to load the chats
    const awaiter = setInterval(() => {
      if (this.sockets.data && this.branchService.id) {
        clearInterval(awaiter);
        this.getChatlist();
        this.noTotalUnreadMessages = this.getTotalUnreadMessages();
      }
    }, 200);

    // Listen to inbound messages
    this.sockets.onMessage.subscribe((message) => {
      // Only show the toast if the message chat is not open
      if (!this.activeCustomerId || (this.activeCustomerId && this.activeCustomerId !== message.from)) {        
        if (this.recipientDetails[message.from]) {
          if (this.recipientList.includes(message.from) === false)
            this.recipientList.push(message.from);
          this.toast.show(`New message (${this.recipientDetails[message.from].name}): ${message.body}`,
          { buttons: [{
            text: 'Reply',
            handler: () => {
              this.toggleChatOpenState();
              timer(300).subscribe(() => this.openMessages(false, message.from));
            }
          }]});
        }
      }

      if (this.isMessagesOpen && this.activeCustomerId === message.from) {
        scrollIntroView(this.chatMessages.nativeElement.children[this.chatMessages.nativeElement.children.length - 1], { time: 500 });
      }

      // Re-process the messaging data
      this.getChatlist();
      this.noTotalUnreadMessages = this.getTotalUnreadMessages();
    });
  }

  ngOnInit() {}
  ngAfterViewInit() {
    // Since messages are specific to thier branches, close the previously opened chat if any
    this.branchService.onChange.subscribe(() => {
      this.closeMessages();
      this.getChatlist();
      this.noTotalUnreadMessages = this.getTotalUnreadMessages();
    });
  }

  toggleChatOpenState() {
    return new Promise((resolve, _) => {
      if (!!this.isChatOpen && this.isMessagesOpen) {
        this.isMessageOpenTemp = false;
        timer(300)
          .subscribe(() => {
            this.isChatOpen = false;
            resolve(null);
          });
      } else {
        if (!this.isMessageOpenTemp && this.isMessagesOpen) {
          this.isChatOpen = !this.isChatOpen;
          timer(300)
            .subscribe(() => {
              this.isMessageOpenTemp = true;
              resolve(null);
            });
        } else {
          this.isChatOpen = !this.isChatOpen;
          resolve(null);
        }
      }
    });
  }

  chooseCustomer() {
    this.customersSelector.open();
    this.customersSelector.changes.subscribe(() => {
      if (!this.recipientDetails[this.customersSelector.selected[0].id])
        this.recipientDetails[this.customersSelector.selected[0].id] = this.customersSelector.selected[0];
      this.openMessages(this.customersSelector.selected[0].id);
    });
  }

  openMessages(isNewChat?: boolean | any, activeCustomerId?: string | any) {
    this.isMessagesOpen = true;
    this.isMessageOpenTemp = true;

    if (typeof isNewChat === 'string') {
      activeCustomerId = isNewChat;
      isNewChat = false;
    }

    this.isNewChat = isNewChat !== undefined ? isNewChat : false;
    if (activeCustomerId) {
      this.activeCustomerId = activeCustomerId;
      this.message.to = activeCustomerId;

      this.setMessageToRead();

      // Scroll to the latest message
      setTimeout(() => {
        scrollIntroView(this.chatMessages.nativeElement.children[this.chatMessages.nativeElement.children.length - 1]);
      }, 500);
    } else {
      this.activeCustomerId = null;
      delete this.message.to;
    }
  }

  closeMessages() {
    this.isMessagesOpen = false;
    this.isMessageOpenTemp = false;
    this.activeCustomerId = null;
    this.message.to = null;
  }

  sendMessage() {
    if (this.fileSelect.file) {
      this.uploadImage()
        .then((url) => {
          this.fileSelect.file = null;
          this.message.attachments = [url];
          this.finalizeMessageSend();
        }).catch(code => {
          if (code) {
            this.toast.show('ERROR: UNABLE TO UPLOAD YOUR IMAGE');
          } else {
            this.toast.show('You\'re not connected to the internet');
          }
        });
    } else {
      this.finalizeMessageSend();
    }
  }

  uploadImage() {
    return new Promise((resolve, reject) => {
      superagent
        // tslint:disable-next-line: max-line-length
        .post(environment.backendServer + '/assets/upload?token=' + this.sockets.data.token + '&isAvatar=false&isPartner=true')
        .attach('file', this.fileSelect.file)
        .on('progress', (e) => {
          this.isUpload = true;
          this.progress = e.percent;
        }).end((error, response) => {
          if (response) {
            this.isUpload = false;
            if (response.status === 200) {
              resolve(response.body.url);
            } else {
              reject(response.status);
            }
          } else {
            reject(0);
          }
        });
    });
  }

  finalizeMessageSend(imageUrl?: string) {
    this.message.from = this.sockets.data.id;
    this.message.branchId = this.branchService.id;

    // After the message has been processed send it to the server
    superagent
      .post(environment.backendServer + '/messaging/message?isPartner=true')
      .set('Authorization', this.sockets.data.token)
      .send(this.message)
      .end((error, response) => {
        console.log('Message send response:', response)
        if (response) {
          if (response.status === 200) {
            this.fileSelect.reset();
            scrollIntroView(this.chatMessages.nativeElement.children[this.chatMessages.nativeElement.children.length - 1]);
            if (this.recipientList.indexOf(this.message.to) === -1)
              this.recipientList.push(this.message.to);
            this.message = { from: this.sockets.data.id, body: '' };
          } else {
            this.toast.show('Message was not sent.');
          }
        } else {
          this.toast.show('You\'re not connected to the internet.');
        }
      });
  }

  getChatlist() {
    this.recipientList = [];
    // tslint:disable-next-line: forin
    for (const chat in this.sockets.data.messages[this.branchService.id]) {
      this.customersService.getCustomerData()
        .then((customers) => {
          customers.forEach((customer) => {
            this.recipientDetails[customer.id] = customer;
          });

          if (this.recipientList.includes(chat) === false)
            this.recipientList.push(chat);
          console.log(this.recipientList, this.recipientDetails)
        });
    }

  }

  recipientSelectChange(selected: Customer[]) {
    this.message.to = selected[0].id;
  }

  setMessageToRead() {
    superagent
      .post([environment.backendServer, 'messaging/message/status'].join('/'))
      .set('Authorization', this.sockets.data.token)
      .send({ branchId: this.branchService.id, customerId: this.activeCustomerId, partnerId: this.sockets.data.id, isPartner: true, status: 2 })
      .end((_, response) => {
        console.log(response);
      })
  }

  // Getting number of messages that are unread
  getUnreadMessagesCount(messages: Message[]): string {
    let count = 0;
    if (messages && messages.length) {
      messages.forEach((message) => {
        if (message.state === 1 && message.type === 'inbound') {
          count++;
        }
      });
    } else {
      return '';
    }

    return count.toString();
  }

  getTotalUnreadMessages() {
    let count = 0;
    if (this.sockets.data.messages && this.branchService.id && this.sockets.data.messages[this.branchService.id]) {
      // tslint:disable-next-line: forin
      for (const chat in this.sockets.data.messages[this.branchService.id]) {
        // tslint:disable: prefer-for-of
        for (const message of this.sockets.data.messages[this.branchService.id][chat]) {
          if (message.type === 'inbound') {
            if (message.state === 1) {
              count++;
            }
          }
        }
      }
    }

    return count;
  }

  clearChats(customerId) {
    this.closeMessages();
    superagent
      .delete(environment.backendServer + '/messaging/chats')
      .send({ customerId, branchId: this.branchService.id, isPartner: true })
      .set('Authorization', this.sockets.data.token)
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            if (this.sockets.data.messages[this.branchService.id]) {
              if (this.sockets.data.messages[this.branchService.id][customerId]) {
                delete this.sockets.data.messages[this.branchService.id][customerId];
                this.getChatlist();
              }
            }
          } else {
            this.toast.show(response.body.reason || 'Error: Unable to delete messages for ' + this.recipientDetails[customerId].name + '.');
          }
        } else {
          this.toast.show('You\'re not connected to the internet.');
        }
      });
  }

  startSearch(event: any) {
    this.searchKeyword = event.srcElement.value.toLowerCase();
    this.searchedCustomers = [];
    if (this.searchKeyword.length) {
      // tslint:disable-next-line: forin
      for (const recipient in this.recipientDetails) {
        // tslint:disable-next-line: max-line-length
        if (this.recipientDetails[recipient].name.toLowerCase().includes(this.searchKeyword) || this.recipientDetails[recipient].id.toLowerCase().includes(this.searchKeyword)) {
          this.searchedCustomers.push(recipient);
        } else {
          if (this.searchKeyword.toLowerCase() === 'online') {
            if (this.recipientDetails[recipient].isOnline === true) {
              this.searchedCustomers.push(recipient);
            }
          } else if (this.searchKeyword.toLowerCase() === 'offline') {
            if (this.recipientDetails[recipient].isOnline === false) {
              this.searchedCustomers.push(recipient);
            }
          }
        }
      }
    }
  }

  openFileSelector(){
    this.fileSelect.openFileSelector();
  }

  addReply(message) {
    this.message.reply = {
      messageId: message.id,
      messageBody: message.body,
      messageType: message.type,
      messageSender: message.from };
  }

  removeReply() {
    this.message.reply = null;
  }

  async openMessageImage(images: string, description: string) {
    this.loader.showLoader(true);
    const modal = await this.modalCtrl.create({
      component: ImageViewComponent,
      componentProps: {
        images: [images],
        productDescription: description
      }
    });
    modal.present();
  }

  scrollToMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
      scrollIntroView(message);
      message.classList.add('blink');

      setTimeout(() => {
        message.classList.remove('blink');
      }, 400);
    }
  }

  deleteMessage(id: string): void {
    superagent
      .delete([environment.backendServer, 'messaging', 'message'].join('/'))
      .set('Authorization', this.sockets.data.token)
      .send({ messageId: id, customerId: this.activeCustomerId, branchId: this.branchService.id })
      .end((_, response) => {
        if (response) {
          if (response.ok) {
            const mIndex = this.sockets.data.messages[this.branchService.id][this.activeCustomerId].findIndex(m => m.id === id);
            if (mIndex){
              this.sockets.data.messages[this.branchService.id][this.activeCustomerId].splice(mIndex, 1);
              if (!this.sockets.data.messages[this.branchService.id][this.activeCustomerId].length)
                delete this.sockets.data.messages[this.branchService.id][this.activeCustomerId];
            }
          } else {
            this.toast.show(response.body.reason || 'Something went wrong.');
          }
        }
        else {
          this.toast.show('You\'re not connected to the internet.');
        }
      });
  }
}
