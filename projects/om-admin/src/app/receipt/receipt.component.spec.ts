import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../environments/environment';
import { RouterStub } from '../../stubs/RouterStub';
import { UtilService } from '../shared/util.service';
import { ReceiptComponent } from './receipt.component';

describe('ReceiptComponent', () => {
  let component: ReceiptComponent;
  let fixture: ComponentFixture<ReceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        /**
         * If we try to use both RouterTestingModule and 
         * {provide: Router, useClass: RouterStub} it will throw error of 
         * cannot read property 'root' of undefined
         */
        // RouterTestingModule.withRoutes([]),

        AngularFireModule.initializeApp(environment.firebaseConfig),
      ],
      providers: [{ provide: Router, useClass: RouterStub }, UtilService],
      declarations: [ReceiptComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
