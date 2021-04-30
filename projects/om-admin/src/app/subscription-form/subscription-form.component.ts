import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Order } from '../models/Order';
import { ProductService } from '../services/product.service';
enum MODE {
  new = 0,
  edit = 1,
}

enum BUTTON {
  ADD_ORDER = 'Add Subscription',
  UPDATE_ORDER = 'Update Subscription',
}

@Component({
  selector: 'app-subscription-form',
  templateUrl: './subscription-form.component.html',
  styleUrls: ['./subscription-form.component.scss']
})
export class SubscriptionFormComponent implements OnInit {

  localities: Array<string> = [];

  orderForm: FormGroup;
  order: any;
  private cartHash = {};
  products: Observable<any>;
  employees: Observable<any>;
  remarks: string;
  productArray: Array<any> = [];
  total: number;
  mode: MODE = MODE.new;

  buttonTitle: string = BUTTON.ADD_ORDER;
  saveStatus: number;
  deliveryDates: Array<{}>;

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  constructor(
    private formBuilder: FormBuilder,
    private db: AngularFirestore,
    private router: Router,
    private ps: ProductService
  ) {
    const state = this.router.getCurrentNavigation().extras.state;
    if (state && state.order) {
      this.order = state.order;
      this.mode = MODE.edit;
      this.buttonTitle = BUTTON.UPDATE_ORDER;

      // this.order.cart.map((d) => {
      //   this.cartHash[d.id] = d;
      // });
    }
  }

  ngOnInit(): void {
    if (this.mode == MODE.new) {
      this.initNewOrder();
    }
    this.initForm();
    this.ps.getLocalities().subscribe((d) => {
      this.localities = d;
    });
    this.products = this.ps.products;

    this.products.pipe(take(1)).subscribe((d: any) => {
      if (d) {
        d.forEach((e) => {
          e.quantity = 0;
        });
      }
      this.productArray = [...d];
      if (this.mode === MODE.edit) {
        this.productArray.forEach((e) => {
          const o = this.cartHash[e.id];
          e.quantity = o ? o.quantity : 0;
        });
        this.productArray = this.productArray.sort(
          (a, b) => b.quantity - a.quantity
        );
      }
    });

    this.deliveryDates = this.getDeliveryDate();

    this.employees = this.ps.getEmployees();
  }

  private initForm() {
    this.orderForm = this.formBuilder.group({
      // name: [this.order.userDetails.displayName, [Validators.required]],
      // email: [this.order.userDetails.email, [Validators.required]],
      // phone: [this.order.userDetails.phoneNumber, [Validators.required]],
      // address: [this.order.userDetails.address, [Validators.required]],
      // zone: [this.order.userDetails.zone, [Validators.required]],
      // locality: [this.order.userDetails.locality, [Validators.required]],
      employee: [this.order.deliveryBoy, [Validators.required]],
      // dateOfDelivery: [(this.order.deliveryDate ? (this.order.deliveryDate as firebase.firestore.Timestamp).toDate() : null), [Validators.required]],
      remarks: [this.order.remarks, []]
    });
  }

  private initNewOrder() {
    this.mode = MODE.new;
    this.buttonTitle = BUTTON.ADD_ORDER;

    this.total = 0.0;
    if (this.productArray) {
      this.productArray.forEach((e) => {
        e.quantity = 0;
      });
    }

    this.order = {
      status: 'open',
      total: 0,
      cart: {},
      deleted: false,
      deliveryDate: null,
      userDetails: {
        address: '',
        displayName: '',
        email: '',
        phoneNumber: '',
        zone: '',
        locality: '',
      },
    };
  }

  submitForm() {
    if (!this.orderForm.valid) {
      console.log('Please provide all the required values!');
      this.showSuccessMessage(false);
      return false;
    } else {
      // let cart = [];
      // this.productArray.forEach((d) => {
      //   if (d.quantity > 0) {
      //     cart.push(d);
      //   }
      // });

      const o = this.orderForm.value;
      let curOrder = {
        deliveryBoy: o.employee,
        remarks: o.remarks,
        updatedAt: null,
      };

      if (this.mode == MODE.new) {
        // this.db
        //   .collection('/orders')
        //   .add(curOrder)
        //   .then((d) => {
        //     this.initNewOrder();
        //     this.initForm();
        //     this.showSuccessMessage(true);
        //   })
        //   .catch((e) => {
        //     this.showSuccessMessage(false);
        //   });
        console.log('Subscription added successfully');
      } else if (this.mode == MODE.edit) {
        // const idMap = {};
        // this.order.cart.forEach((d) => (idMap[d.id] = d));
        // curOrder.cart = curOrder.cart.map((item) => {
        //   if (idMap[item.id]) {
        //     return { ...idMap[item.id], ...item };
        //   }
        //   return item;
        // });
        curOrder = {
          ...curOrder,
          updatedAt: firebase.firestore.Timestamp.now()
        };
        this.db
          .collection('/subscriptions')
          .doc(this.order.id)
          .set(curOrder, { merge: true })
          .then((d) => {
            this.initNewOrder();
            this.initForm();
            this.showSuccessMessage(true);
          })
          .catch((e) => {
            this.showSuccessMessage(false);
          });
        console.log('Subscription updated successfully');
      }
    }
  }

  private showSuccessMessage(flag: boolean) {
    if (flag) {
      this.saveStatus = 1;
    } else {
      this.saveStatus = 0;
    }
    setTimeout(() => {
      this.saveStatus = -1;
    }, 3500);
  }

  getTotal() {
    if (this.productArray) {
      this.total = this.productArray.reduce((total, d) => {
        total += d.quantity * d.price;
        return total;
      }, 0);
      return this.total;
    }
    return 0.0;
  }

  // ///////////////////////////////////

  private getDeliveryDate() {
    let date = new Date();
    const hour = date.getHours();

    let dayString = 'Saturday';
    let dayString2 = 'Wednesday';
    // ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // Thur 9PM to Mon 9PM -
    // message should show “delivery to be done on Wednesday” otherwise “Saturday”
    const curDay = date.getDay();
    let daysTillNextDeliveryDate = 6 - curDay; // default to Saturday
    let daysTillSecondDeliveryDate = daysTillNextDeliveryDate + 4; // default to next wednesday
    if (
      (curDay == 4 && hour >= 21) ||
      curDay > 4 ||
      (curDay == 1 && hour < 21) ||
      curDay < 1
    ) {
      dayString = 'Wednesday';
      daysTillNextDeliveryDate = 3 - curDay;
      if (daysTillNextDeliveryDate < 0) {
        // Thur (-1), Fri (-2), Sat (-3)
        daysTillNextDeliveryDate = daysTillNextDeliveryDate + 6 + 1;
      }

      // get the second delivery date days count
      // cound second delivery date by adding curDay to wednesday(3)
      daysTillSecondDeliveryDate = daysTillNextDeliveryDate + 3;
      dayString2 = 'Saturday';
    }

    // get first delivery date string
    let obj1 = this.getDateString(daysTillNextDeliveryDate);
    obj1.dateStr = `${dayString} (${obj1.dateStr})`;
    // get second delivery date string
    let obj2 = this.getDateString(daysTillSecondDeliveryDate);
    obj2.dateStr = `${dayString2} (${obj2.dateStr})`;
    return [obj1, obj2];
  }

  private getDateString(daysTillNextDeliveryDate: number) {
    let date = new Date();
    date.setHours(0, 0, 0, 0);
    return this.getDateStringFromDate(date, daysTillNextDeliveryDate);
  }

  getDateStringFromDate(date, daysTillNextDeliveryDate) {
    date.setDate(date.getDate() + daysTillNextDeliveryDate);
    // get month after the updated date (above setDate),
    // so that updated month (in case adding days changes month) is fetched
    const curMonth = date.getMonth();
    const deliveryDate = date.getDate();
    let dateStr =
      (deliveryDate > 9 ? deliveryDate : '0' + deliveryDate) +
      '/' +
      (curMonth > 8 ? curMonth + 1 : '0' + (curMonth + 1)) +
      '/' +
      date.getFullYear();
    return { date, dateStr };
  }

}
