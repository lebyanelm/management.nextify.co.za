import { TestBed } from '@angular/core/testing';

import { SidemenuControlsService } from './sidemenu-controls.service';

describe('SidemenuControlsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SidemenuControlsService = TestBed.get(SidemenuControlsService);
    expect(service).toBeTruthy();
  });
});
