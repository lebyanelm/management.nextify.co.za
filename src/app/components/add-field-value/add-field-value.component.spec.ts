import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AddFieldValueComponent } from './add-field-value.component';

describe('AddFieldValueComponent', () => {
  let component: AddFieldValueComponent;
  let fixture: ComponentFixture<AddFieldValueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFieldValueComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AddFieldValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
