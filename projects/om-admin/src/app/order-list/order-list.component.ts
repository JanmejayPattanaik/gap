import {Component} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import * as XLSX from 'xlsx';
import {Order} from '../models/Order';
import {AuthService} from '../services/auth.service';
import {ProductService} from '../services/product.service';
import {ConfirmDialogService} from '../shared/confirm-dialog/confirm-dialog.service';

@Component({selector: 'app-order-list', templateUrl: './order-list.component.html', styleUrls: ['./order-list.component.scss']})
export class OrderListComponent {
  private monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  locality = new FormControl();
  deliveryDate = new FormControl();
  // @ViewChild(MatSelect) localitySelect: MatSelect;

  localities : Array < string > = [];
  deliveryDates : Set < any > = new Set();
  // localities: Observable<any>; localitiesSub: Subscription;
  orders : Observable < any >;

  filterLocalitySub : BehaviorSubject < string[] > = new BehaviorSubject < string[] > (null);
  filterDateSub : BehaviorSubject < number[] > = new BehaviorSubject < number[] > (null);

  _showClosed : boolean = false;
  exportReady : boolean = false;
  fileName : string = 'Orders.xlsx';

  get showClosed() {
    return this._showClosed;
  }

  set showClosed(flag : boolean) {
    this._showClosed = flag;
    this
      .ps
      .getOrders(this._showClosed);
    // this.selectAll();
  }

  constructor(private fireAuth : AngularFireAuth, private db : AngularFirestore, private auth : AuthService, private router : Router, private dialogService : ConfirmDialogService, public ps : ProductService) {
    this.loadFromCache();

    this
      .auth
      .isLoggedIn$
      .subscribe(async(loggedIn) => {
        if (loggedIn) {
          this
            .ps
            .getLocalities()
            .subscribe((d) => {
              this.localities = d;
              this.setSelectedLocalities(this.ps.selectedLocalities || this.localities);
            });

          if (!this.ps.orders$.getValue()) {
            await this
              .ps
              .getOrders(false);
            this.deliveryDates = this.ps.deliveryDates;
          }

          this.orders = combineLatest([this.ps.orders$, this.filterLocalitySub, this.filterDateSub]).pipe(filter(([d, localities, dates]) => Boolean(d) && Boolean(localities) && Boolean(dates))).pipe(map(([d, localities, dates] : [Order[], string[], number[]]) => {
            this.ps.selectedLocalities = localities;
            this.ps.selectedDates = dates;

            return d.filter((x : any) => {
              const xLocality = x
                .userDetails
                .locality
                .split('-')
                .join(' ');
              return localities.includes(xLocality) && this.isDateSelected(dates, x);
            });
          }));
        }
      });
  }

  private isDateSelected(dates : number[], x : any) {
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

  loadFromCache() {
    this.deliveryDates = this.ps.deliveryDates;
    this
      .filterDateSub
      .next(this.ps.selectedDates);
  }

  // showReceipt(order) {   const navigationExtras: NavigationExtras = { state: {
  //      order: order,     },   };   this.router.navigate(['receipt'],
  // navigationExtras); }

  deleteOrder(order) {
    const options = {
      title: 'Delete Order?',
      message: 'Do you really want to delete this order?',
      cancelText: 'NO',
      confirmText: 'YES'
    };
    this
      .dialogService
      .open(options);
    this
      .dialogService
      .confirmed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          order.deleted = true;
          order.status = 'closed';
          this
            .db
            .collection('/orders')
            .doc(order.id)
            .set(order, {merge: true});
        }
      });
  }

  cancelOrder(order) {
    const options = {
      title: 'Cancel Order?',
      message: 'Do you really want to cancel this order?',
      cancelText: 'NO',
      confirmText: 'YES'
    };
    this
      .dialogService
      .open(options);
    this
      .dialogService
      .confirmed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          order.deleted = true;
          order.status = 'cancel';
          this
            .db
            .collection('/orders')
            .doc(order.id)
            .set(order, {merge: true});
        }
      });
  }

  toggleOrder(order, close = true) {
    if (close) {
      order.status = 'closed';
    } else {
      order.status = 'open';
    }
    this
      .db
      .collection('/orders')
      .doc(order.id)
      .set(order, {merge: true});
  }

  getDate(createdAt : firebase.firestore.Timestamp) {
    const d = createdAt.toDate();

    // let amPm = 'AM'; let hrs = 0; if (d.getHours() > 12) {   hrs = d.getHours() -
    // 12;   amPm = 'PM'; } else {   hrs = d.getHours();   if (hrs == 0) {     hrs
    // = 12;   }   amPm = 'AM'; } let dateStr = `${   this.monthNames[d.getMonth()]
    // } ${d.getDate()} ${hrs}:${d.getMinutes()} ${amPm}`; let dateStr =
    // `${d.toLocaleDateString()} <br> ${hrs}:${d.getMinutes()} ${amPm}`;

    let dateStr = moment(d).format('DD/MM/YY LT');
    return dateStr;
  }

  onLocalityChange(value) {
    this.triggerLocalityChange(value);
  }

  private triggerLocalityChange(value : any) {
    this
      .filterLocalitySub
      .next(value);
  }

  private triggerDateChange(value : any) {
    setTimeout(() => {
      this
        .filterDateSub
        .next(value);
    }, 100);
  }

  setSelectedLocalities(value : any) {
    this
      .locality
      .setValue(value);
    this.triggerLocalityChange(value);
  }
  selectAll() {
    this
      .locality
      .setValue(this.localities);
    this.triggerLocalityChange(this.localities);
  }
  deselectAll() {
    this
      .locality
      .setValue([]);
    this.triggerLocalityChange([]);
  }

  selectAllDates() {
    let arr = [];
    this
      .deliveryDates
      .forEach(x => {
        arr.push(x.value);
      })
    this.ps.selectedDates = [...arr];
    this.triggerDateChange(this.ps.selectedDates);
  }
  deselectAllDates() {
    // this.deliveryDate.setValue([]);
    this.ps.selectedDates = [];
    this.triggerDateChange([]);
  }

  getRevisedTotal(o) {
    return Math.round(o.total + (o.adjustedAmount || 0));
  }
  exportToExcel() {
    this.exportReady = true;
    setTimeout(() => {
      /* table id is passed over here */
      let element = document.getElementById('order-table');
      const ws : XLSX.WorkSheet = XLSX
        .utils
        .table_to_sheet(element, < XLSX.Table2SheetOpts > {
          display: true
        });

      /* generate workbook and add the worksheet */
      const wb : XLSX.WorkBook = XLSX
        .utils
        .book_new();
      XLSX
        .utils
        .book_append_sheet(wb, ws, 'Sheet1');

      /* save to file */
      XLSX.writeFile(wb, this.fileName);
      this.exportReady = false;
    }, 0);
  }

  ondeliveryDateChange(valueObj) {
    this.triggerDateChange(valueObj);
  }
}
