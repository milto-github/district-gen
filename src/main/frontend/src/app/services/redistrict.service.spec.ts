import { TestBed, inject } from '@angular/core/testing';

import { RedistrictService } from './redistrict.service';

describe('RedistrictService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RedistrictService]
    });
  });

  it('should be created', inject([RedistrictService], (service: RedistrictService) => {
    expect(service).toBeTruthy();
  }));
});
