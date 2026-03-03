import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Api } from './api';

describe('Api', () => {
  let service: Api;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(Api);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
