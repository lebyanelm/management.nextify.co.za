import { StatusService } from './services/status.service';
import { BranchService } from './services/branch.service';
import { ComponentsModule } from './components/components/components.module';
import { ToastService } from './services/toast.service';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SocketsService } from './services/sockets.service';
import { SlideshowModule } from 'ng-simple-slideshow';
import { CategoriesService } from './services/categories.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OrderStatusService } from './services/order-status.service';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserAnimationsModule,
    ComponentsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    SlideshowModule
  ],
  providers: [
    CategoriesService,
    SocketsService,
    BranchService,
    ToastService,
    StatusService,
    OrderStatusService,

    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
