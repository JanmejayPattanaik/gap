import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  storage: Storage;
  public isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(public fireAuth: AngularFireAuth) {
    this.storage = window.localStorage;

    this.fireAuth.authState.subscribe((user) => {
      this.storage.setItem('loggedIn', '' + (user !== null));
      this.isLoggedIn$.next(user !== null);
      this.saveUserToStorage(user);
    });
  }

  saveUserToStorage(user: any) {
    this.storage.setItem('user', user ? JSON.stringify(user) : null);
  }

  // Login in with email/password
  SignIn(email, password) {
    return this.fireAuth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    await this.fireAuth.signOut();
  }

  isLoggedIn() {
    return this.storage.getItem('loggedIn') === 'true';
  }
}
