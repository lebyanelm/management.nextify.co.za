import { Section } from './../../interfaces/Section';
import { NewSectionComponent } from './../new-section/new-section.component';
import { SelectComponent } from './../select/select.component';
import { Branch } from './../../interfaces/Branch';
import { Extra } from './../../interfaces/Extra';
import { ToastService } from './../../services/toast.service';
import { SocketsService } from './../../services/sockets.service';
import { ModalController, IonRange } from '@ionic/angular';
import { LoaderService } from './../../services/loader.service';
import { Product } from '../../interfaces/Product';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { timer } from 'rxjs';
import * as superagent from 'superagent';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements AfterViewInit, OnInit {
  @ViewChild('ImagesInput', {static: false}) imagesInput: ElementRef<HTMLInputElement>;
  @ViewChild('CreateProductButton', {static: false}) createButton: ElementRef<HTMLInputElement>;
  @ViewChild('Extras', {static: false}) extras: SelectComponent;
  @ViewChild('Sides', {static: false}) sides: SelectComponent;
  @ViewChild('Branches', {static: false}) branches: SelectComponent;
  @ViewChild('ExpectedPrepareTime', {static: false}) expectedPrepareTime: IonRange;
  @Input() category: string;
  isLoading = false;
  isLoaderComplete = false;
  isReady = false;
  isDuplicate = false;

  extrasOptions: Extra[] = [];
  sidesOptions: Product[] = [];
  branchOptions: Branch[] = [];

  data: Product | any = {
    name: '',
    price: '',
    category: '',
    buys: 0,
    description: '',
    images: [],
    inStock: true,
    expectedPrepareTime: {lower: 0, upper: 0},
    noRequiredSides: 0,
    extras: [],
    dietary: '',
    sides: [],
    branches: [],
    sections: []
  };
  initialData: Product | any = {};

  constructor(
    private loader: LoaderService,
    private modalCtrl: ModalController,
    private sockets: SocketsService,
    private toast: ToastService
  ) {
    if (this.category) {
      this.data.category = this.category;
    }

    // Set the options the user can select from on all selects
    this.sidesOptions = this.sockets.data.products;
    this.branchOptions = this.sockets.data.branches;
    this.extrasOptions = this.sockets.data.extras;

  }

  ngAfterViewInit() {
    this.loader.state.subscribe((s) => {
      if (s.isModal) {
        if (s.state) {
          this.isLoading = s.state;
        } else {
          this.isLoaderComplete = !s.state;
          timer(500).subscribe(() => {
            this.isLoading = s.state;
            this.isLoaderComplete = false;
            this.modalCtrl.dismiss();
          });
        }
      }
    });

    this.imagesInput.nativeElement.onchange = (ev) => {
      // Check the size of the file, if it's 2MB large reject the image
      const file = this.imagesInput.nativeElement.files[0],
        size = this.getFileSize(file.size);
      if (size.isMbUnit && size.size > 2) {
        this.toast.show('Selected image is to large, please compress it and try again.');
      } else {
        const image = {
          name: this.generateRandomName() + '.' + file.name.split('.').pop(),
          state: 'Uploading',
          url: '',
          index: this.data.images.length === 0 ? 0 : 1,
          progress: 0 };

        this.data.images.push(image);

        superagent
          .post(environment.backendServer + '/assets/upload?token=' + this.sockets.data.token + '&name=' + image.name)
          .on('progress', (event) => {
            this.isReady = false;
            this.data.images[image.index].progress = event.percent;
            if (event.percent === 100 && event.direction === 'upload') {
              this.data.images[image.index].state = 'Uploaded';
            }
          })
          .attach('file', file)
          .end((error, response) => {
            if (response) {
              if (response.status === 200) {
                this.data.images[image.index].url = response.body.url;
                this.isReady = true;
              }
            }
          });
      }
    };
  }

  ngOnInit() {
    console.log(this.data)
    if (this.data.id) {
      // Make copies of the data passed
      this.data = { ...this.data };
      this.initialData = { ...this.data };
      
      delete this.data.sockets;
      delete this.initialData.sockets;
      delete this.data.loader;
      delete this.initialData.loader;
      delete this.data.modalCtrl;
      delete this.initialData.modalCtrl;
      delete this.data.toast;
      delete this.initialData.toast;

      // Resolve the product and extras names
      this.resolveSides();
      this.resolveExtras();
    }
  }

  resolveSides() {
    // Reparse the sides and find the names and properties of the sides/products
    const sideIds = [...this.data.sides];
    this.data.sides = [];
    sideIds.forEach((sideId) => {
      const resolvedSide = this.resolveSide(sideId);
      if (resolvedSide) {
        this.data.sides.push(resolvedSide);
      }
    });
  }

  resolveExtras() {
    // Reparse the extras and find the names and properties of the extras
    const extrasIds = [...this.data.extras];
    this.data.extras = [];
    extrasIds.forEach((extrasId) => {
      const resolvedExtra = this.resolveExtra(extrasId);
      if (resolvedExtra) {
        this.data.extras.push(resolvedExtra);
      }
    });
  }

  // Use the product ID of a side to get product information
  resolveSide(id) {
    const side = this.sockets.data.products.find((s) => s.id === (typeof id === 'string' ? id : id.id));
    return side ? side : null;
  }

  resolveExtra(id) {
    const extra = this.sockets.data.extras.find((e) => e.id === (typeof id === 'string' ? id : id.id));
    return extra ? extra : null;
  }

  async openSectionAdder() {
    this.loader.showLoader(true);
    const sectionAdderModal = await this.modalCtrl.create({
      component: NewSectionComponent,
      cssClass: ['modal', 'new-section-modal'] });
    sectionAdderModal.onDidDismiss()
      .then((data) => {
        if (data.data) {
          this.data.sections.push(data.data);
        }
      });
    sectionAdderModal.present().then(() => this.loader.showLoader(false));
  }

  removeSection(section: Section): void {
    const sectionIndex = this.data.sections.indexOf(section);
    if (sectionIndex !== -1) {
      this.data.sections.splice(sectionIndex, 1);
    }
  }

  async editSection(section: Section): Promise<any> {
    const sectionIndex = this.data.sections.indexOf(section),
      newSectionModal = await this.modalCtrl.create({
        component: NewSectionComponent,
        cssClass: ['modal', 'new-section-modal'],
        componentProps: {
          data: section
        }
      });

    newSectionModal.onDidDismiss()
      .then((data) => {
        if (data.data) {
          this.data.sections[sectionIndex] = data.data;
        }
      });
    newSectionModal.present();
  }

  createProduct() {
    this.loader.showLoader(true);
    this.backdropDismiss(false);
    this.isLoading = true;

    // Get the values of the select data
    this.getSelectValues();

    // Reformat the image as URLs only before creating the product
    // Only if product is not being duplicated
    const images = this.data.images;
    this.data.images = [];
    images.forEach((image) => {
      if (typeof image === 'string') {
        this.data.images.push(image);
      } else {
        this.data.images.push(image.url);
      }
    });

    // Send an API Request to the partners backend and create the product
    superagent
      .post(environment.backendServer + '/product?partnerId=' + this.sockets.data.id)
      .send({ ...this.data })
      .set('Authorization', this.sockets.data.token)
      .on('progress', (event) => this.loader.pipe(event.percent))
      .end((_, response) => {
        if (response) {
          if (response.status === 201) {
            this.loader.showLoader(false);
            this.toast.show('SUCCESS: PRODUCT CREATED.', {duration: 3000});
            this.sockets.data.products.push(response.body);
            this.sockets.change.next();
            this.modalCtrl.dismiss();
          } else if (response.status === 500) {
            this.toast.show('Unexpected error occured.', {buttons: [{text: 'Report'}]});
          }
        } else {
          this.toast.show('You\'re not connected to the internet');
        }
      });
  }

  editProduct() {
    const changes = this.getChanges();
    const images = this.data.images;
    
    this.loader.showLoader(true);
    this.isLoading = true;
    this.getSelectValues();
    
    // Parse the image to a required format
    this.data.images = [];
    images.forEach((image) => {
      if (typeof image === 'string') {
        this.data.images.push(image);
      } else {
        this.data.images.push(image.url);
      }
    });
    changes.images = this.data.images;

    if (changes.expectedPrepareTime && changes.expectedPrepareTime.upper && changes.expectedPrepareTime.lower === undefined) {
      if (this.initialData.expectedPrepareTime && this.initialData.expectedPrepareTime.lower !== undefined) {
        changes.expectedPrepareTime.lower = this.initialData.expectedPrepareTime.lower;
      } else {
        changes.expectedPrepareTime.lower = 5;
      }
    } else if (changes.expectedPrepareTime && changes.expectedPrepareTime.lower && changes.expectedPrepareTime.upper === undefined) {
      if (this.initialData.expectedPrepareTime && this.initialData.expectedPrepareTime.upper !== undefined)  {
        changes.expectedPrepareTime.upper = this.initialData.expectedPrepareTime.upper;
      } else {
        // Add 5 min to the upper expected time
        changes.expectedPrepareTime.upper = changes.expectedPrepareTime.lower + 5;
        alert('Added 5');
      }
    } 

    // Send a request to save the edits of the product
    superagent
      .patch(environment.backendServer + '/product')
      .send({ changes, id: this.data.id })
      .set('Authorization', this.sockets.data.token)
      .end((error, response) => {
        this.loader.showLoader(true);
        this.isLoading = false;
        if (response) {
          if (response.status === 200) {
            for (let index in this.sockets.data.products) {
              if (this.sockets.data.products[index].id === this.data.id) {
                // tslint:disable-next-line: forin
                for (let change in changes) {
                  this.sockets.data.products[index][change] = changes[change];
                  if (typeof changes[change] === 'string' || typeof changes[change] === 'boolean' || typeof changes[change] === 'number') {
                    this.sockets.data.products[index][change] = changes[change];
                  } else if (typeof this.sockets.data.products[index][change] === 'object') {
                    if (changes[change].constructor === Object) {
                      // tslint:disable-next-line: forin
                      for (let property in changes[change]) {
                        this.sockets.data.products[index][change][property] = changes[change][property];
                      }
                    } else if (changes[change].constructor === Array) {
                      this.sockets.data.products[index][change] = [];
                      changes[change].forEach((c) => this.sockets.data.products[index][change].push(c));
                    }
                  }
                }

                break;
              }
            }

            this.toast.show('CHANGES SAVED.');
            this.loader.showLoader(false);
            this.resolveSides();
            this.resolveExtras();
            this.modalCtrl.dismiss();
          } else {
            this.toast.show(response.body.reason);
          }
        } else {
          this.toast.show('ERROR: NO INTERNET CONNECTION.');
        }
      });
  }

  getChanges() {
    const changes: any = {};
    for (const change in this.data) {
      console.log(this.data[change], change, this.data.timeCreated)
      if (typeof this.data[change] === 'string' || typeof this.data[change] === 'number' || typeof this.data[change] === 'boolean') {
        if (this.data[change] !== this.initialData[change]) {
          changes[change] = this.data[change];
        }
      } else if (typeof this.data[change] === 'object') {
        if (this.data[change] && this.data[change].constructor === Object) {
          for (let property in this.data[change]) {
            if (this.data[change][property] !== this.initialData[change][property]) {
              if (!changes[change]) {
                changes[change] = {};
              }

              changes[change][property] = this.data[change][property];
              break;
            }
          }
        } else if (this.data[change] && this.data[change].constructor === Array) {
          changes[change] = this.data[change];
        }
      }
    }


    console.log(changes, this.data)
    return changes;
  }

  isObject(value) {
    let isObject = false;
    if (typeof value === 'object') {
      isObject = true;
    }
  }

  getSelectValues() {
    if (this.extras.selected) {
      this.data.extras = [];
      this.extras.selected.forEach((extra) => {
        this.data.extras.push(extra.id);
      });
    }

    if (this.sides.selected) {
      this.data.sides = [];
      this.sides.selected.forEach((side) => {
        this.data.sides.push(side.id);
      });
    }
  }

  backdropDismiss(state) {
    this.modalCtrl.getTop()
      .then((modal) => {
        modal.backdropDismiss = state;
      });
  }

  openImageSelector() {
    this.imagesInput.nativeElement.click();
  }

  removeProductImage(index) {
    if (typeof index === 'number') {
      this.data.images.splice(index, 1);
    } else {
      this.data.images.splice(this.data.images.indexOf(index), 1);
    }
  }

  generateRandomName(nameLength = 5) {
    const numbers = '0123456789';
    let name = '';
    for (let index = 0; index < nameLength; index++) {
      name += numbers.charAt(Math.floor(Math.random() * (numbers.length - 1)));
    }
    return name;
  }

  getFileSize(size: number) {
    size = size / 1024;
    if (size > 1024) {
      return {size: size / 1024, isMbUnit: true};
    } else {
      return {size, isMbUnit: false};
    }
  }

  getOptions(section: Section): string {
    // Initiialise an empty array to place option names within them
    const options = [];

    // Look through every single option available in the section
    section.options.forEach((option) => options.push(option.name));

    // Return a single string of options joined together
    return options.join(', ');
  }

  duplicate() {
    this.isDuplicate = true;

    // Change the name to show it is a duplicate of something
    this.data.name = ['Copy of', this.data.name].join(' ');

    // Remove automatically assigned parameters
    delete this.data.id;
    delete this.data.buys;
    delete this.data.views;
    delete this.data.timeCreated;
  }
}
