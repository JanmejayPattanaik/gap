import {Component, OnInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../services/auth.service';
import {FormGroup, FormControl} from '@angular/forms';
import {Location} from '@angular/common';

import {distinctUntilChanged, filter, debounceTime, take, map} from 'rxjs/operators';
import * as firebase from 'firebase';
import {UtilService} from '../shared/util.service';
import {MatDialog} from '@angular/material/dialog';
import {ModalDialogComponent} from '../modal-dialog/modal-dialog.component';
import {NavigationExtras, Router} from '@angular/router';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {ProductService} from '../services/product.service';
import {Order} from '../models/Order';

enum units {
  KG = 'kg',
  GRAM = 'gms'
}
@Component({selector: 'app-stock', templateUrl: './stock.component.html', styleUrls: ['./stock.component.scss']})
export class StockComponent implements OnInit,
OnDestroy {
  range = new FormGroup({start: new FormControl(), end: new FormControl()});
  // ordersSub$: Subscription;
  vendor = new FormControl();
  selectedVendors : Array < string > = [];
  dataMap : any = {};

  deliveryDate = new FormControl();
  deliveryDates : Set < any > = new Set();
  filterDateSub : BehaviorSubject < number[] > = new BehaviorSubject < number[] > (null);

  orders : Subscription;

  constructor(private db : AngularFirestore, private auth : AuthService, private cd : ChangeDetectorRef, private util : UtilService, public dialog : MatDialog, private router : Router, private location : Location, public ps : ProductService) {
    this.loadFromCache();

    this
      .auth
      .isLoggedIn$
      .subscribe(async(loggedIn) => {
        if (loggedIn) {
          this
            .range
            .valueChanges
            .pipe(debounceTime(350))
            .pipe(filter(({end, start}) => end != null && start != null))
            .subscribe(({end, start}) => {
              // console.log(d);
              if (start && end && start < end && (start !== this.ps.date.start || end !== this.ps.date.end)) {
                const statusArr = ['open', 'accepted'];
                this.ps.date = {
                  start: start,
                  end: end
                };
                this
                  .db
                  .collection('orders', (ref) => ref.where('createdAt', '>=', firebase.firestore.Timestamp.fromDate(start)).where('createdAt', '<', firebase.firestore.Timestamp.fromDate(end)).where('status', 'in', statusArr))
                  .valueChanges()
                  .pipe(take(1))
                  .subscribe((data) => {
                    this.parseData(data);
                  });
              }
            });

          // vendor formcontrol change observable
          this
            .vendor
            .valueChanges
            .subscribe((d) => {
              this.ps.selectedVendors = this.selectedVendors = d;
              this
                .cd
                .detectChanges();
            });

          if (!this.ps.orders$.getValue()) {
            await this
              .ps
              .getOrders(false);
            this.deliveryDates = this.ps.deliveryDates;
          }

          this.orders = combineLatest([this.ps.orders$, this.filterDateSub]).pipe(filter(([d, dates]) => Boolean(d) && Boolean(dates))).pipe(map(([d, dates] : [Order[], number[]]) => {
            this.ps.selectedDates = dates;

            return d.filter((x : any) => {
              return this.isDateSelected(dates, x);
            });
          })).pipe(map((data) => {
            this.parseData(data);
          })).subscribe();
        }
      });
  }
  ngOnDestroy() : void {
    console.log("ngOnDestroy");
    this
      .orders
      .unsubscribe();
  }

  ngOnInit() : void {}

  loadFromCache() {
    console.log("loadFromCache");
    this
      .range
      .setValue(this.ps.date);
    this.selectedVendors = this.ps.selectedVendors;
    this
      .vendor
      .setValue(this.selectedVendors);
    this.dataMap = this.ps.vendorDataMap;
    this.deliveryDates = this.ps.deliveryDates;
    this
      .filterDateSub
      .next(this.ps.selectedDates);
  }

  private isDateSelected(dates : number[], x : any) {
    console.log("isDateSelected");
    return dates.some((e : any) => {
      if (x.deliveryDate) {
        return (e === (x.deliveryDate as firebase.firestore.Timestamp).toMillis());
      } else if (e === 'rest') {
        return true;
      } else {
        return false;
      }
    });
  }
  loadStock(dates) {
    console.log("loadStock");
    // this.db   .collection('orders', (ref) =>     ref       .where(
    // 'deliveryDate',         '>=', firebase.firestore.Timestamp.fromDate(start) )
    //      .where('status', '==', 'open')   )   .valueChanges() .pipe(take(1))
    // .subscribe((data) => {     this.parseData(data);   });
  }

  parseData(data : any) {
    console.log("parseData");
    let vSet = new Set < string > ();
    this.dataMap = {};
    const len = data.length;
    for (let i = 0; i < len; i++) {
      const cart = data[i].cart;
      const cartLen = cart.length;
      for (let j = 0; j < cartLen; j++) {
        let item = cart[j];
        const vName = item.vendor;
        // add vendor name
        vSet.add(vName);
        if (!this.dataMap[vName]) {
          this.dataMap[vName] = {};
        }
        if (!this.dataMap[vName][item.name]) {
          this.dataMap[vName][item.name] = {};
          this.dataMap[vName][item.name]['quantity'] = 0;
          this.dataMap[vName][item.name]['metric'] = '';
        }
        item = this
          .util
          .updateQuantityProperties(item);
        this.dataMap[vName][item.name]['quantity'] += this.getQuantityInMetrics(item);
        let metricName = this.getDisplaybleMetric(item.metric);
        this.dataMap[vName][item.name]['metric'] = metricName;

        // add SKU distribution for each product
        if (!this.dataMap[vName][item.name].skus) {
          this.dataMap[vName][item.name].skus = {};
        }
        let sku = this.dataMap[vName][item.name].skus;
        let key = item.metric === 'kg'
          ? `${item.quantity * 1000} gms`
          : `${item.quantity * item.unitSize} gms`;

        if (sku[key]) {
          sku[key]['count']++;
        } else {
          let uSize = item.unitSize % 1000 === 0
            ? item.unitSize / 1000
            : item.unitSize;
          sku[key] = {};
          // sku[key]['unit'] = `${item.name}`;
          sku[key]['count'] = 1;
        }
      }
    }

    // save to store
    this.ps.vendorDataMap = this.dataMap;
    this.ps.selectedVendors = this.selectedVendors = Array.from < string > (vSet);
    //
    this
      .vendor
      .setValue(this.selectedVendors);
    this
      .cd
      .detectChanges();
  }

  filterData() {
    console.log("filterData");
    // let res = Object.keys(this.dataMap).filter((x) => {   return
    // this.selectedVendors.indexOf(x) > -1; });
    let res = {};
    for (let x in this.dataMap) {
      if (this.selectedVendors.indexOf(x) > -1) {
        // res.push(...this.dataMap[x]);
        res[x] = this.dataMap[x];
      }
    }
    return res;
  }

  selectAll() {
    console.log("selectAll");
    // console.log(event);
    this
      .vendor
      .setValue(Object.keys(this.dataMap));
    // this.triggerLocalityChange(this.ps.getLocalities());
  }
  deselectAll() {
    console.log("deselectAll");
    this
      .vendor
      .setValue([]);
    // this.triggerLocalityChange([]);
  }

  getQuantityInMetrics(cartItem) : number {
    console.log("getQuantityInMetrics");
    if (cartItem.metric === units.KG) {
      return cartItem.quantity * cartItem.unitSize;
    }
    if (cartItem.metric === units.GRAM) {
      return (cartItem.quantity * cartItem.unitSize) / 1000;
    } else {
      return cartItem.quantity;
    }
  }

  getDisplaybleMetric(metric) {
    console.log("getDisplaybleMetric");
    if (metric === units.KG || metric === units.GRAM) {
      return 'kg';
    }
  }

  showSKUs(key, data) {
    console.log("showSKUs");
    let vendorSKUs = [];
    for (let x in data) {
      const rgx = /(gram|gm|kg)/i;
      const res = x.match(rgx);
      if (res) {
        vendorSKUs.push({productName: x, skus: data[x].skus});
      }
    }

    const navigationExtras : NavigationExtras = {
      state: {
        data: {
          vendorName: key,
          vendorSKUs: vendorSKUs
        }
      }
    };
    this
      .router
      .navigate(['sku'], navigationExtras);
  }

  open(key, skus) {
    console.log("open");
    // const dialogRef = this.dialog.open(ModalDialogComponent, {   data: {
    // productName: key, skus: skus }, }); dialogRef.afterClosed().subscribe((d) =>
    // {   this.location.back(); });

    const navigationExtras : NavigationExtras = {
      state: {
        data: {
          productName: key,
          skus: skus
        }
      }
    };
    this
      .router
      .navigate(['sku'], navigationExtras);
  }

  selectAllDates() {
    console.log("selectAllDates");
    let arr = [];
    this
      .deliveryDates
      .forEach((x) => {
        arr.push(x.value);
      });
    this.ps.selectedDates = [...arr];
    this.triggerDateChange(this.ps.selectedDates);
  }

  deselectAllDates() {
    console.log("deselectAllDates");
    // this.deliveryDate.setValue([]);
    this.ps.selectedDates = [];
    this.triggerDateChange([]);
  }

  private triggerDateChange(value : any) {
    console.log("triggerDateChange");
    setTimeout(() => {
      this
        .filterDateSub
        .next(value);
    }, 100);
  }

  ondeliveryDateChange(valueObj) {
    console.log("ondeliveryDateChange");
    this.triggerDateChange(valueObj);
  }
}
