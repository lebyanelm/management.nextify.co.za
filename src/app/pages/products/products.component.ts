import { LoaderService } from 'src/app/services/loader.service';
import { Product } from './../../interfaces/Product';
import { CategoriesService } from './../../services/categories.service';
import { SocketsService } from 'src/app/services/sockets.service';
import { ProductModalComponent } from './../../components/product-modal/product-modal.component';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ModalController, IonSelect } from '@ionic/angular';
import { timer, interval } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements AfterViewInit {
  @ViewChild('IonSelect', {static: false}) ionSelect: IonSelect;
  @ViewChild('SearchInput', {static: false}) searchInput: ElementRef<HTMLInputElement>;
  categories: string[] = [];
  currentCategory = '';
  categoryProductIndices: number[] = [];
  isSearch = false;
  searchList: number[] = [];

  constructor(
    private modalCtrl: ModalController,
    public sockets: SocketsService,
    private loader: LoaderService
  ) {
    // Try to get categories of the products
    const awaiter = interval(1000)
      .subscribe(() => {
        if (this.sockets.data) {
          this.getProductCategories();
          this.sockets.change.subscribe(() => {
            if (this.sockets.data.products.length > 0) {
              this.getProductCategories();
            } else {
              this.categories = [];
              this.categoryProductIndices = [];
              this.currentCategory = '';
            }
          });
          awaiter.unsubscribe();
        }
      });
  }

  ngAfterViewInit() {
    this.ionSelect.ionChange.subscribe((event) => {
      this.setCurrentFocusedCategory(event.detail.value);
    });

    // Listen for keyboard events to initiate a search
    this.searchInput.nativeElement.onkeyup = () => {
      const searchKeyWord = this.searchInput.nativeElement.value.toLowerCase();
      this.isSearch = searchKeyWord.length > 0;
      this.searchList = [];
      if (this.isSearch) {
        this.sockets.data.products.forEach((product, index) => {
          if (product.category === this.currentCategory) {
            const scan = (object: Product) => {
              for (let property in object) {
                if (property !== 'category' && property !== 'branches') {
                  if (typeof object[property] === 'string' || typeof object[property] === 'number') {
                    if (object[property].toString().toLowerCase().includes(searchKeyWord)) {
                      if (this.searchList.indexOf(index) === -1) {
                        this.searchList.push(index);
                      }
                      break;
                    }
                  } else if (typeof object[property] === 'object') {
                    scan(object[property]);
                  }
                }
              }
            }
            scan(product);
          }
        })
      }
    }
  }

  getProductCategories(category?: string) {
    this.sockets.data.products.forEach((product, index) => {
      if (index === 0) {
        this.setCurrentFocusedCategory(category || product.category);
      }
      if (this.categories.includes(product.category) === false) {
        this.categories.push(product.category);
      }
    });
  }

  setCurrentFocusedCategory(category: string) {
    if (category) {
      this.currentCategory = category;
      this.buildProductIndices();
    }
  }

  buildProductIndices() {
    this.categoryProductIndices = [];
    this.sockets.data.products.forEach((product, index) => {
      if (product.category === this.currentCategory) {
        this.categoryProductIndices.push(index);
      }
    });
  }

  async openProductModal() {
    this.loader.showLoader(true);
    const modal = await this.modalCtrl.create({
      component: ProductModalComponent,
      cssClass: 'modal product-modal',
      componentProps: {
        category: this.currentCategory
      }
    });

    modal.present().then(() => this.loader.showLoader(false));
  }
}
