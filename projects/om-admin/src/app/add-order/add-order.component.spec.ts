import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../environments/environment';
import { RouterStub } from '../../stubs/RouterStub';

import { AddOrderComponent } from './add-order.component';

describe('AddOrderComponent', () => {
  let component: AddOrderComponent;
  let fixture: ComponentFixture<AddOrderComponent>;

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
      providers: [FormBuilder, { provide: Router, useClass: RouterStub }],
      declarations: [AddOrderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
