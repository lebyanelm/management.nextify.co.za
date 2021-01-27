import { OrderTranscriptComponent } from './../order-transcript/order-transcript.component';
import { FeedbackModalComponent } from './../feedback-modal/feedback-modal.component';
import { AddDriverModalComponent } from './../add-driver-modal/add-driver-modal.component';
import { DriversComponent } from './../../pages/drivers/drivers.component';
import { GetStatementComponent } from './../get-statement/get-statement.component';
import { AddFieldValueComponent } from './../add-field-value/add-field-value.component';
import { NewSectionComponent } from './../new-section/new-section.component';
import { FileSelectorComponent } from './../file-selector/file-selector.component';
import { ChatComponent } from '../chat/chat.component';
import { DropdownComponent } from './../dropdown/dropdown.component';
import { BannersComponent } from './../../pages/banners/banners.component';
import { ExtrasComponent } from './../../pages/extras/extras.component';
import { SelectOptionsComponent } from './../select/select-options/select-options.component';
import { SelectComponent } from './../select/select.component';
import { SettingComponent } from './../setting/setting.component';
import { FloatRangeComponent } from './../range/range.component';
import { BranchCreatorComponent } from './../branch-creator/branch-creator.component';
import { SendMessageModalComponent } from './../send-message-modal/send-message-modal.component';
import { AvatarUploadComponent } from './../avatar-upload/avatar-upload.component';
import { AuthorizationComponent } from './../authorization/authorization.component';
import { OrderComponent } from './../order/order.component';
import { ImageViewComponent } from './../image-view/image-view.component';
import { PromocodeModalComponent } from './../promocode-modal/promocode-modal.component';
import { FormsModule } from '@angular/forms';
import { NoResultsComponent } from './../no-results/no-results.component';
import { ProductModalComponent } from './../product-modal/product-modal.component';
import { PromocodesComponent } from './../../pages/promocodes/promocodes.component';
import { ProductComponent } from './../product/product.component';
import { SettingsComponent } from './../../pages/settings/settings.component';
import { ReportsComponent } from './../../pages/reports/reports.component';
import { UserAccountsComponent } from './../../pages/user-accounts/user-accounts.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { SidebarComponent } from './../sidebar/sidebar.component';
import { HeaderComponent } from './../header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from 'src/app/pages/orders/orders.component';
import { ProductsComponent } from 'src/app/pages/products/products.component';
import { LoaderComponent } from 'src/app/components/loader/loader.component';
import { SlideshowModule } from 'ng-simple-slideshow';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ExtrasModalComponent } from '../extras-modal/extras-modal.component';
import { SidesComponent } from 'src/app/pages/sides/sides.component';
import { BannerModalComponent } from '../banner-modal/banner-modal.component';
import { MessageComponent } from '../message/message.component';
import { WithdrawModalComponent } from '../withdraw-modal/withdraw-modal.component';
import { SetWithdrawAccountComponent } from '../set-withdraw-account/set-withdraw-account.component';
import { HighchartsChartModule } from 'highcharts-angular';
@NgModule({
  declarations: [
    HeaderComponent,
    SidebarComponent,
    OrdersComponent,
    OrderComponent,
    ProductComponent,
    ProductsComponent,
    PromocodesComponent,
    UserAccountsComponent,
    ReportsComponent,
    SettingsComponent,
    ProductModalComponent,
    PromocodeModalComponent,
    NoResultsComponent,
    ImageViewComponent,
    LoaderComponent,
    AuthorizationComponent,
    AvatarUploadComponent,
    SendMessageModalComponent,
    BranchCreatorComponent,
    FloatRangeComponent,
    SettingComponent,
    SelectComponent,
    SelectOptionsComponent,
    ExtrasComponent,
    ExtrasModalComponent,
    SidesComponent,
    BannerModalComponent,
    BannersComponent,
    DropdownComponent,
    NewSectionComponent,
    AddFieldValueComponent,
    // Drivers Management Page
    DriversComponent,
    AddDriverModalComponent,
    // Messaging
    ChatComponent,
    MessageComponent,
    FileSelectorComponent,
    // Withdrawal
    WithdrawModalComponent,
    SetWithdrawAccountComponent,
    // Statements
    GetStatementComponent,
    // For sending a feedback
    FeedbackModalComponent,
    // For viewing order details
    OrderTranscriptComponent
  ],
  entryComponents: [
    ProductModalComponent,
    PromocodeModalComponent,
    ImageViewComponent,
    AuthorizationComponent,
    AvatarUploadComponent,
    SendMessageModalComponent,
    BranchCreatorComponent,
    SelectComponent,
    SelectOptionsComponent,
    ExtrasModalComponent,
    BannerModalComponent,
    NewSectionComponent,
    AddFieldValueComponent,
    WithdrawModalComponent,
    SetWithdrawAccountComponent,
    AddDriverModalComponent,
    // Statements
    GetStatementComponent,
    FeedbackModalComponent,
    OrderTranscriptComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IonicModule,
    SlideshowModule,
    NgxChartsModule,
    HighchartsChartModule
  ],
  exports: [
    HeaderComponent,
    SidebarComponent,
    OrdersComponent,
    OrderComponent,
    PromocodesComponent,
    ProductComponent,
    ProductsComponent,
    UserAccountsComponent,
    ReportsComponent,
    SettingsComponent,
    ProductModalComponent,
    DriversComponent,
    PromocodeModalComponent,
    NoResultsComponent,
    ImageViewComponent,
    LoaderComponent,
    AuthorizationComponent,
    AvatarUploadComponent,
    SendMessageModalComponent,
    BranchCreatorComponent,
    FloatRangeComponent,
    SettingComponent,
    SelectComponent,
    SelectOptionsComponent,
    ExtrasComponent,
    ExtrasModalComponent,
    SidesComponent,
    BannerModalComponent,
    BannersComponent,
    DropdownComponent,
    ChatComponent,
    MessageComponent,
    FileSelectorComponent,
    NewSectionComponent,
    AddFieldValueComponent,
    WithdrawModalComponent,
    SetWithdrawAccountComponent,
    GetStatementComponent,
    AddDriverModalComponent,
    FeedbackModalComponent,
    OrderTranscriptComponent
  ]
})
export class ComponentsModule { }
