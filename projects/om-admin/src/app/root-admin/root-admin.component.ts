import { Component, OnInit, AfterViewInit } from '@angular/core';
import {
  AngularFirestore,
  QuerySnapshot,
  DocumentData,
} from '@angular/fire/firestore';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-root-admin',
  templateUrl: './root-admin.component.html',
  styleUrls: ['./root-admin.component.scss'],
})
export class RootAdminComponent implements AfterViewInit {
  col: any;
  constructor(
    private db: AngularFirestore,
    private auth: AuthService,
    private prodService: ProductService
  ) {}

  ngAfterViewInit(): void {
    this.auth.isLoggedIn$.pipe(filter(Boolean)).subscribe((loggedIn) => {
      if (loggedIn) {
        return;
      }
    });
  }

  // change adjustedTotal to adjustedAmount
  //
  //   this.db
  //     .collection('orders')
  //     .ref
  //     // .where('adjustedTotal', '<', 0)
  //     .get()
  //     .then((d: QuerySnapshot<DocumentData>) => {
  //       this.col = d;
  //       // console.log(d.docs);

  //       let batch = this.db.firestore.batch();
  //       d.docs.forEach((x: DocumentData) => {
  //         let data = x.data();
  //         // console.log(data);
  //         const adjT = data.adjustedTotal;
  //         delete data.adjustedTotal;
  //         data.adjustedAmount = adjT;
  //         batch.set(x.ref, data);
  //       });
  //       batch.commit().catch((e) => console.log(e));
  //     });
  // }

  // set deleted Flag to false, if not set already
  // this.db
  //   .collection('orders')
  //   .ref.get()
  //   .then((d: QuerySnapshot<DocumentData>) => {
  //     this.col = d;
  //     let batch = this.db.firestore.batch();
  //     d.docs.forEach((x: DocumentData) => {
  //       let data = x.data();
  //       // console.log(data);
  //       data.deleted = data.deleted || false;
  //       batch.set(x.ref, data);
  //     });
  //     batch.commit().catch((e) => console.log(e));
  //   });

  // update all existing orders metric from 'gram' to 'gms'
  // this.db
  //   .collection('orders')
  //   .ref // .where('adjustedTotal', '<', 0)
  //   .where('status', '==', 'open')
  //   .get()
  //   .then((d: QuerySnapshot<DocumentData>) => {
  //     this.col = d;
  //     // console.log(d.docs);

  //     let batch = this.db.firestore.batch();
  //     d.docs.forEach((x: DocumentData) => {
  //       let data = x.data();
  //       data.cart.forEach((item) => {
  //         if (item.metric === 'gram' || item.metric === 'gm') {
  //           item.metric = 'gms';
  //         }
  //       });
  //       // console.log(data);
  //       batch.set(x.ref, data);
  //     });
  //     batch.commit().catch((e) => console.log(e));
  //   });

  // add new localities
  // let batch = this.db.firestore.batch();
  //   this.prodService.localities.forEach((x) => {
  //     var docRef = this.db.collection('localities').doc(this.db.createId()).ref;
  //     batch.set(docRef, { name: x });
  //   });
  //   batch.commit().catch((e) => console.log(e));


  // update categories
  // this.db.collection('categories')
  // .ref
  // .get()
  // .then((d: QuerySnapshot<DocumentData>) => {
  //   let batch = this.db.firestore.batch();
  //     d.docs.forEach((x: DocumentData) => {
  //       const data = x.data();
        
  //       const newObj = {imageUrl: data.imageUrl, name: data.name, subCategory: data.subcategory || []};
  //       console.log(newObj);
  //       batch.set(x.ref, newObj);
  //     });
  //   batch.commit().catch((e) => console.log(e));
  // })
  onSubmit() {
    
  }  
}
