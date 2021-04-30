import { TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../environments/environment';

import { CanLoadService } from './can-load.service';

describe('CanLoadService', () => {
  let service: CanLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
    });
    service = TestBed.inject(CanLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
