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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
  @ViewChild('RecipientsSelect', {static: false}) recipientSelect: SelectComponent;
  @ViewChild('FileSelect', {static: false}) fileSelect: FileSelectorComponent;
  @ViewChild('ChatMessages', {static: false}) chatMessages: ElementRef<HTMLElement>;
  isChatOpen = true;
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
    public socketsService: SocketsService,
    public branchService: BranchService,
    private toast: ToastService,
    public status: StatusService
  ) {

    // Wait for the data to be available to load the chats
    const awaiter = setInterval(() => {
      if (this.socketsService.data && this.branchService.id) {
        clearInterval(awaiter);
        this.getChatlist();
        console.log('Awaiter ended...')
        this.noTotalUnreadMessages = this.getTotalUnreadMessages();
      }
    }, 200);

    // Listen to inbound messages
    this.socketsService.onMessage.subscribe((message) => {
      // Only show the toast if the message chat is not open
      if (!this.activeCustomerId || (this.activeCustomerId && this.activeCustomerId !== message.from)) {
        if (this.recipientDetails[message.from]) {
          this.toast.show(`New message (${this.recipientDetails[message.from].name}): ${message.body}`);
        }
      }

      if (this.isMessagesOpen) {
        scrollIntroView(this.chatMessages.nativeElement, { time: 500 });
      }

      // Re-process the messaging data
      this.getChatlist();
      this.noTotalUnreadMessages = this.getTotalUnreadMessages();
    });
  }

  ngOnInit() {}
  ngAfterViewInit() {
    this.toggleChatOpenState();

    // Since messages are specific to thier branches, close the previously opened chat if any
    this.branchService.onChange.subscribe(() => {
      this.closeMessages();
      this.getChatlist();
      this.noTotalUnreadMessages = this.getTotalUnreadMessages();
      console.log('Reloading the messages...');
    });
  }

  toggleChatOpenState() {
    if (!!this.isChatOpen && this.isMessagesOpen) {
      this.isMessageOpenTemp = false;
      timer(300)
        .subscribe(() => {
          this.isChatOpen = false;
        });
    } else {
      if (!this.isMessageOpenTemp && this.isMessagesOpen) {
        this.isChatOpen = !this.isChatOpen;
        timer(300)
          .subscribe(() => {
            this.isMessageOpenTemp = true;
          });
      } else {
        this.isChatOpen = !this.isChatOpen;
      }
    }
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

      // Scroll to the latest message
      setTimeout(() => {
        console.log(this.chatMessages)
        scrollIntroView(this.chatMessages.nativeElement, {time: 500});
      }, 500);
    } else {
      this.activeCustomerId = null;
      delete this.message.t0;
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
        .post(environment.backendServer + '/assets/upload?token=' + this.socketsService.data.token + '&isAvatar=false&isPartner=true')
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
    this.message.from = this.socketsService.data.id;
    this.message.branchId = this.branchService.id;

    if (this.isNewChat && this.recipientSelect.selected.length) {
      this.message.to = this.recipientSelect.selected[0].id;
    }

    // After the message has been processed send it to the server
    superagent
      .post(environment.backendServer + '/messaging/message?isPartner=true')
      .set('Authorization', this.socketsService.data.token)
      .send(this.message)
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            console.log(response.body.message)
            let isInMessagesBefore = false;
            if (!this.socketsService.data.messages) {
              this.socketsService.data.messages = {};
            }

            if (!this.socketsService.data.messages[this.branchService.id]) {
              this.socketsService.data.messages[this.branchService.id] = {};
            }

            if (!this.socketsService.data.messages[this.branchService.id][this.message.to]) {
              this.socketsService.data.messages[this.branchService.id][this.message.to] = [];
              isInMessagesBefore = false;
            }

            this.getChatlist();
            this.openMessages(false, this.message.to);
            this.socketsService.data.messages[this.branchService.id][this.message.to].push(response.body.message);
            this.message.body = '';
            this.fileSelect.reset();
            setTimeout(() => {
              scrollIntroView(this.chatMessages.nativeElement, {time: 500});
            }, 500);
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
    for (const chat in this.socketsService.data.messages[this.branchService.id]) {
      console.log(chat);
      this.customersService.getCustomer(chat)
        .then((customer) => {
          console.log(customer);
          this.recipientDetails[chat] = customer;
          this.recipientList.push(chat);
        });
    }
  }

  loadCustomers(cb: (customers) => Customer[]) {
    return new Promise(async (resolve) => {
      this.customersService.getCustomerData()
        .then((customers) => {
          resolve(customers);
        }).catch((er) => console.error(er));
    });
  }

  recipientSelectChange(selected: Customer[]) {
    this.message.to = selected[0].id;
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
    if (this.socketsService.data.messages && this.branchService.id && this.socketsService.data.messages[this.branchService.id]) {
      // tslint:disable-next-line: forin
      for (const chat in this.socketsService.data.messages[this.branchService.id]) {
        // tslint:disable: prefer-for-of
        for (const message of this.socketsService.data.messages[this.branchService.id][chat]) {
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
      .set('Authorization', this.socketsService.data.token)
      .end((error, response) => {
        if (response) {
          if (response.status === 200) {
            if (this.socketsService.data.messages[this.branchService.id]) {
              if (this.socketsService.data.messages[this.branchService.id][customerId]) {
                delete this.socketsService.data.messages[this.branchService.id][customerId];
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
}
