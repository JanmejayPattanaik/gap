import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterStub } from './../../stubs/RouterStub';
import { SkuDetailsComponent } from './sku-details.component';


// class RouterStub {
//   getCurrentNavigation() {
//     return {
//       extras: {
//         state: {
//           data: {
//             vendorSKUs: [],
//           },
//         },
//       },
//     };
//   }
// }

describe('SkuDetailsComponent', () => {
  let component: SkuDetailsComponent;
  let fixture: ComponentFixture<SkuDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [{ provide: Router, useClass: RouterStub }],
      declarations: [SkuDetailsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkuDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
