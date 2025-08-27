import { TestBed } from '@angular/core/testing';

import { WatsonxService } from '../watsonx.service';

describe('WatsonxService', () => {
  let service: WatsonxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatsonxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
