import { Location } from '@angular/common';
import { async, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';
import { routes } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';

describe('AppComponent', () => {


  // const FirestoreStub = {
  //   collection: (name: string) => ({
  //     doc: (_id: string) => ({
  //       valueChanges: () => new BehaviorSubject({ foo: 'bar' }),
  //       set: (_d: any) => new Promise((resolve, _reject) => resolve),
  //     }),
  //   }),
  // };

  const auth = {
    isLoggedIn$: {
      subscribe: () => {
        return false;
      }
    }
  }

  // let router = {
  //   navigate: jasmine.createSpy('navigate')
  // }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes(routes),
        AngularFireModule.initializeApp(environment.firebaseConfig),
        // AngularFirestoreModule
        // AngularFireAuthModule
      ],
      providers: [
        // { provide: AngularFirestore, useValue: FirestoreStub },
        // { provide: AuthService, useValue: auth },
        // { provide: Router, useValue: router },
        // {provide: APP_BASE_HREF, useValue : '/' },
        // Router,
        // AuthService
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  
  

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'om-admin'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('om-admin');
  });

  // xit('should render title', () => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();
  //   const compiled = fixture.debugElement.nativeElement;
  //   expect(compiled.querySelector('.content router-outlet').textContent).toContain('om-admin app is running!');
  // });

  it('should not be logged in', (done) => {
    const fixture  = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const auth = TestBed.inject(AuthService);
    auth.isLoggedIn$.subscribe(d => {
      expect(d).toBe(false);
      done()
    })
  })
  // xit('should navigate to login page, if user not logged in', fakeAsync(() => {
  //   const fixture = TestBed.createComponent(AppComponent);
  //   fixture.detectChanges();  
  //   const router = TestBed.inject(Router);
  //   const location = TestBed.inject(Location);
  //   // const auth = TestBed.inject(AuthService);
  //   // spyOn(auth.isLoggedIn$, 'subscribe').and.returnValue(of(false));
  //   router.initialNavigation();  
  //   // spyOn(fixture.componentInstance['router'], 'navigate');
  //   router.navigate(['']);
  //   tick();
  //   // spyOn<any>(fixture.componentInstance['router'], 'navigate').and.returnValue(true);
    
  //   // const auth = TestBed.inject(AuthService);
  //   // auth.isLoggedIn$.subscribe(d => {
  //     // expect(d).toBe(false);
  //     expect(location.path()).toBe('/login')
  //     // setTimeout(() => {
  //       // expect(router.navigate).toHaveBeenCalledWith(['login'])
  //     // }, 1000);
  //   // })
  // }))
});
