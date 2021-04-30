import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormControl, FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';
import {AuthService} from './../services/auth.service';

@Component({selector: 'app-login', templateUrl: './login.component.html', styleUrls: ['./login.component.scss']})
export class LoginComponent implements OnInit,
OnDestroy {
  loginSub : Subscription;
  formSubmitted : boolean = false;

  constructor(private fb : FormBuilder, private db : AngularFirestore, public fireAuth : AngularFireAuth, private auth : AuthService, private router : Router) {}

  async ngOnInit() {
    this.form = this
      .fb
      .group({
        'username': [
          '', Validators.compose([Validators.required])
        ],
        'password': [
          '', Validators.compose([Validators.required])
        ]
      });

    this.loginSub = this
      .auth
      .isLoggedIn$
      .pipe(distinctUntilChanged())
      .subscribe((d) => {
        if (d) {
          console.log("d ::", d);
          this
            .router
            .navigate(['messaging']);
        } else {
          console.log('user not logged in');
        }
      });
  }

  form : FormGroup = new FormGroup({username: new FormControl(''), password: new FormControl('')});

  submit() {
    this.formSubmitted = true;

    if (this.form.valid) {
      // console.log(this.form.value);
      this
        .auth
        .SignIn(this.form.value.username, this.form.value.password)
        .then((res) => {})
        .catch((e) => {
          console.log(e);
        });

      this
        .submitEM
        .emit(this.form.value);
    } else {
      console.log("The form is NOT valid");
      this.formSubmitted = false;
    }
  }
  @Input()error : string | null;

  @Output()submitEM = new EventEmitter();

  ngOnDestroy() {
    if (this.loginSub) {
      this
        .loginSub
        .unsubscribe();
    }
  }
}
