import {BrowserModule} from '@angular/platform-browser';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AngularFireModule} from '@angular/fire';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {environment} from '../environments/environment';
import {OrderListComponent} from './order-list/order-list.component';
import {ReceiptComponent} from './receipt/receipt.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ServiceWorkerModule} from '@angular/service-worker';
// import { ConfirmDialogComponent } from
// './shared/confirm-dialog/confirm-dialog.component';
import {ConfirmDialogModule} from './shared/confirm-dialog/confirm-dialog.module';

import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {SkuDetailsModule} from './sku-details/sku-details.module';
import {ModalDialogComponent} from './modal-dialog/modal-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    // OrderListComponent,
    ReceiptComponent,
    ModalDialogComponent
  ],
  imports: [
    BrowserModule, AppRoutingModule, BrowserAnimationsModule, AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFirestoreModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
    ConfirmDialogModule,
    SkuDetailsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}