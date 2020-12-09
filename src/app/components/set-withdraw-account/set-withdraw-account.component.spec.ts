import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SetWithdrawAccountComponent } from './set-withdraw-account.component';

describe('SetWithdrawAccountComponent', () => {
  let component: SetWithdrawAccountComponent;
  let fixture: ComponentFixture<SetWithdrawAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetWithdrawAccountComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SetWithdrawAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
