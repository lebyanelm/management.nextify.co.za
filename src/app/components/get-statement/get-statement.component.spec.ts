import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GetStatementComponent } from './get-statement.component';

describe('GetStatementComponent', () => {
  let component: GetStatementComponent;
  let fixture: ComponentFixture<GetStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GetStatementComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GetStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
