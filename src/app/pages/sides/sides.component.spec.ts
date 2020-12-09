import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SidesComponent } from './sides.component';

describe('SidesComponent', () => {
  let component: SidesComponent;
  let fixture: ComponentFixture<SidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidesComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
