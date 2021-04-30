import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public localities$: BehaviorSubject<any> = new BehaviorSubject(null);
  public categories$: BehaviorSubject<any> = new BehaviorSubject(null);
  public orders$: BehaviorSubject<any> = new BehaviorSubject(null);
  public subscriptions$: BehaviorSubject<any> = new BehaviorSubject(null);
  public employees$: BehaviorSubject<any> = new BehaviorSubject(null);
  public products: Observable<any>;
  public selectedLocalities: string[];
  public deliveryDates: Set<any> = new Set();
  public selectedDates: any[] = [];
  public selectedSubscriptionDate: Date = new Date();
  public vendorDataMap: any;
  public selectedVendors: string[];
  public date: any = { start: Date, end: Date };

  constructor(private db: AngularFirestore) {
    // set time of subscription date to 00:00:00, as its irrelevant
    // also helps with date comparison against calendar dates which also doesn't have time.
    this.selectedSubscriptionDate.setHours(0, 0, 0, 0);

    this.products = this.db
      .collection('/products', (ref) => {
        return ref.orderBy('createdAt', 'desc');
      })
      .valueChanges({ idField: 'id' });

    this.db
      .collection('/localities', (ref) => ref.orderBy('name', 'asc'))
      .valueChanges()
      .subscribe((d: string[]) => {
        let temp = [];
        d.forEach((x: any) => {
          temp.push(x.name);
        });
        this.localities$.next([...temp, 'Others']);
      });

      // TODO: check this as its throwing a permission error in console
    this.db
      .collection('/categories', (ref) => ref.orderBy('name', 'asc'))
      .valueChanges({ idField: 'id' })
      .subscribe((d) => {
        this.categories$.next(d);
      });
  }

  getOrders(showClosed: boolean) {
    let status = 'open';
    if (showClosed) {
      status = 'closed';
    }

    this._getOrders(status)
      .subscribe((d: Object[]) => {
        let datesMap = new Set<any>();
        d.forEach((x: any) => {
          if (x.deliveryDate) {
            datesMap.add(
              (x.deliveryDate as firebase.firestore.Timestamp).toMillis()
            );
          }
        });
        const sortedArr = [...datesMap].sort();
        sortedArr.forEach((x) => {
          this.deliveryDates.add({
            name: moment(x).format('dddd DD/MM/YY'),
            value: x,
          });
        });
        // add an entry for empty delivery dates in orders
        this.deliveryDates.add({
          name: 'Orders Without Dates',
          value: 'rest',
        });
        // this.deliveryDates = Array.from(datesMap).sort();
        // this.deliveryDates = this.deliveryDates;
        this.orders$.next(d);
      });
  }

  getSubscriptions(showActive: boolean = true) {
    // let status = 'open';
    // if (showClosed) {
    //   status = 'closed';
    // }

    this._getSubscriptions(showActive)
      .subscribe((d: Object[]) => {
        // let datesMap = new Set<any>();
        // d.forEach((x: any) => {
        //   if (x.deliveryDate) {
        //     datesMap.add(
        //       (x.deliveryDate as firebase.firestore.Timestamp).toMillis()
        //     );
        //   }
        // });
        // const sortedArr = [...datesMap].sort();
        // sortedArr.forEach((x) => {
        //   this.deliveryDates.add({
        //     name: moment(x).format('dddd DD/MM/YY'),
        //     value: x,
        //   });
        // });
        // // add an entry for empty delivery dates in orders
        // this.deliveryDates.add({
        //   name: 'Orders Without Dates',
        //   value: 'rest',
        // });
        this.subscriptions$.next(d);
      });
  }

  getLocalities() {
    return this.localities$;
  }

  getCategories() {
    return this.categories$;
  }

  getEmployees(role = 'delivery') {
    if(!this.employees$.value) {
      this._getEmployees(role).subscribe(d => {
        this.employees$.next(d);
      })
    }
    return this.employees$;
  }

  /////////////////////////////////////

  private _getOrders(status): Observable<any> {
    // if (this.orders$.getValue()) {
    //   return this.orders$.asObservable();
    // }

    let statusArr = ['closed'];
    if(status == 'open') {
      statusArr = ['open', 'accepted'];
    }
    return this.db
      .collection<Object[]>('/orders', (ref) => {
        return ref
          .where('status', 'in', statusArr)
          .where('deleted', '==', false)
          .orderBy('userDetails.locality', 'asc')
          .orderBy('createdAt', 'desc');
      })
      .valueChanges({ idField: 'id' }); // need IdField for delete/update to work.
    // .snapshotChanges();
  }

  private _getSubscriptions(active = true): Observable<any> {    
    return this.db
      .collection<Object[]>('/subscriptions', (ref) => {
        return ref
          .where('active', '==', active)
          .orderBy('userDetails.locality', 'asc')
          .orderBy('createdAt', 'desc');
      })
      .valueChanges({ idField: 'id' }); // need IdField for delete/update to work.
    // .snapshotChanges();
  }

  private _getEmployees(role): Observable<any> {    
    return this.db
      .collection<Object[]>('/employees', (ref) => {
        return ref
          .where('role', '==', role)
          .orderBy('name', 'asc');
      })
      .valueChanges({ idField: 'id' }); // need IdField for delete/update to work.
    // .snapshotChanges();
  }
}
