import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BranchSelectorPage } from './branch-selector.page';

describe('BranchSelectorPage', () => {
  let component: BranchSelectorPage;
  let fixture: ComponentFixture<BranchSelectorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BranchSelectorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BranchSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
