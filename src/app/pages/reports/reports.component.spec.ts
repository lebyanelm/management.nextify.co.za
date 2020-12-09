import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ReportsComponent } from './reports.component';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// <thead>
//                 <tr>
//                     <td class="active" data-index="1">
//                         <div class="flexbox">
//                             <div class="count"><div class="center">1</div></div>
//                             <div>
//                                 <div class="label"><b>Your Balance</b></div>
//                                 <div class="range">(Funds due to you)</div>
//                             </div>
//                         </div>
//                     </td>
//                     <td data-index="2">
//                         <div class="flexbox">
//                             <div class="count"><div class="center">2</div></div>
//                             <div>
//                                 <div class="label"><b>Quantities Sold</b></div>
//                                 <div class="range">(From the start)</div>
//                             </div>
//                         </div>
//                     </td>
//                     <td data-index="3">
//                         <div class="flexbox">
//                             <div class="count"><div class="center">3</div></div>
//                             <div>
//                                 <div class="label"><b>Total Orders</b></div>
//                                 <div class="range">(From the start)</div>
//                             </div>
//                         </div>
//                     </td>
//                     <td data-index="4">
//                         <div class="flexbox">
//                             <div class="count"><div class="center">4</div></div>
//                             <div>
//                                 <div class="label"><b>Total Customers</b></div>
//                                 <div class="range">(In Total)</div>
//                             </div>
//                         </div>
//                     </td>
//                 </tr>
//             </thead>
//             <tbody>
//                 <tr>
//                     <!-- Profit -->
//                     <td data-index="1">
//                         <div class="value bolder" [attr.isNegativeBalance]="sockets.data?.snapshots.totalEarnings < 0"><b>R {{sockets.data.snapshots.totalEarnings.toLocaleString()}}</b></div>
//                         <div class="percentage flexbox" [attr.isIncreasing]=false>
//                             <ion-icon name="stats-chart-sharp"></ion-icon>
//                             <span>0%</span>
//                         </div>
//                     </td>

//                     <!-- Quantities -->
//                     <td data-index="2">
//                         <div class="value">{{sockets.data.snapshots.quantitiesSold.toLocaleString()}}</div>
//                         <div class="percentage flexbox">
//                             <ion-icon name="stats-chart-sharp"></ion-icon>
//                             <span>0%</span>
//                         </div>
//                     </td>

//                     <!-- Orders -->
//                     <td data-index="3">
//                         <div class="value">{{sockets.data.snapshots.totalOrders.toLocaleString()}}</div>
//                         <div class="percentage flexbox">
//                             <ion-icon name="stats-chart-sharp"></ion-icon>
//                             <span>0%</span>
//                         </div>
//                     </td>

//                     <!-- Customers -->
//                     <td data-index="4">
//                         <div class="value">{{sockets.data.customers.length.toLocaleString()}}</div>
//                         <div class="percentage flexbox">
//                             <ion-icon name="stats-chart-sharp"></ion-icon>
//                             <span>0%</span>
//                         </div>
//                     </td>
//                 </tr>
//             </tbody>