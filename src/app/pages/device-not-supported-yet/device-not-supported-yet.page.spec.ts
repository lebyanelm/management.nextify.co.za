import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeviceNotSupportedYetPage } from './device-not-supported-yet.page';

describe('DeviceNotSupportedYetPage', () => {
  let component: DeviceNotSupportedYetPage;
  let fixture: ComponentFixture<DeviceNotSupportedYetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceNotSupportedYetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceNotSupportedYetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
