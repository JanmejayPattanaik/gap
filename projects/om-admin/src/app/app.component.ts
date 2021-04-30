import {Component, OnInit} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {Router} from '@angular/router';
import {AuthService} from './services/auth.service';
import {AutoUnsub} from './shared/AutoUnsub';

@AutoUnsub()
@Component({selector: 'app-root', templateUrl: './app.component.html', styleUrls: ['./app.component.scss']})
export class AppComponent implements OnInit {

  title = 'om-admin';
  showAdminMenu = false;
  showCustMenu = false;
  isLoggedOut = false;

  constructor(private db : AngularFirestore,
  // public fireAuth: AngularFireAuth,
  public auth : AuthService, private router : Router) {}

  ngOnInit() : void {

    console.log("Login status :: ", this.auth.isLoggedIn());

    if (!this.auth.isLoggedIn()) {
      this
        .router
        .navigate(['login']);
    } else {
      this.isLoggedOut = true;
      this.showAdminMenu = true;
      // this.showCustMenu = true;
    }
  }

  logout() : void {
    console.log('iside logout');
    this
      .auth
      .signOut();
    console.log('iside isLoggedOut ::: ', this.auth.isLoggedIn());
    this
      .router
      .navigate(['login']);
    this.isLoggedOut = false;
    this.showAdminMenu = false;
    this.showCustMenu = false;
  }

}
