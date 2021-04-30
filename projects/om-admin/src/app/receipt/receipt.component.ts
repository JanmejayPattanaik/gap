import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Order } from '../models/Order';
import { UtilService } from './../shared/util.service';

enum units {
  KG = 'kg',
  GRAM = 'gms',
}
@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
})
export class ReceiptComponent implements OnInit {
  order: Order = new Order('1', [], {}, 'open', 0, '');
  saveStatus: number;
  showNote: boolean = false;
  isOrderAccepted: boolean = false;

  constructor(
    private router: Router,
    private db: AngularFirestore,
    private util: UtilService
  ) {
    const state = this.router.getCurrentNavigation().extras.state;
    if (state && state.order) {
      this.order = { ...this.order, ...state.order };
      this.order.cart = this.order.cart.map((d) => {
        // fix existing orders that have a deliveryQuantity for Kilo products
        // d.deliveryQuantity = null;

        // const name = d.name.toLowerCase();
        // below regex output: {size:"500", unit:"gram" }
        return this.util.updateQuantityProperties(d);
      });
      this.order.cart.sort((a, b) => {
        if (a.category < b.category) {
          return -1;
        } else if (a.category > b.category) {
          return 1;
        } else {
          return a.name > b.name ? 1 : -1;
        }
      });
      // if order has adjusted total, enable the note section in the receipt
      if (this.order.adjustedAmount || this.order.notes) {
        this.showNote = true;
      }
      // set order status
      this.isOrderAccepted = this.order.status !== 'open';
    }
  }

  ngOnInit(): void {}

  getItemTotal(cartItem) {
    // change in process. All items will be measured in the units the item is sold.
    // if(cartItem.deliveryGrammage !== undefined) {
    //   cartItem.deliveryQuantity = cartItem.deliveryGrammage / cartItem.unitSize;
    // }
    //////////////////
    if (cartItem.metric === units.KG) {
      cartItem.deliveryQuantity = cartItem.deliveryGrammage / 1000;
      // return cartItem.deliveryQuantity * cartItem.price;
    } else if (cartItem.metric === units.GRAM) {
      cartItem.deliveryQuantity = cartItem.deliveryGrammage / cartItem.unitSize;
      // return cartItem.deliveryQuantity * cartItem.price;
    }

    return cartItem.deliveryQuantity * cartItem.price;
  }

  getDate() {
    try {
      const d = (this.order.createdAt as firebase.firestore.Timestamp).toDate();
      let dateStr = moment(d).format('DD/MM/YY LT');
      return dateStr;
    } catch (e) {
      console.log('Invalid Order. createdAt date not found.');
    }
  }

  getTotal() {
    this.order.total = this.order.cart.reduce((total, d) => {
      total += this.getItemTotal(d);
      return total;
    }, 0);
    this.order.total = parseFloat(this.order.total.toFixed(2));
    return this.order.total;
  }

  geAdjustedAmount() {
    return Math.round(this.getTotal() + this.order.adjustedAmount);
  }

  setAdjustedAmount(adjAmt) {
    this.order.adjustedAmount = parseFloat(adjAmt.toFixed(2));
  }

  saveOrder(callback = null) {
    this.db
      .collection(`orders`)
      .doc(this.order.id)
      .set(this.order, { merge: true })
      .then((res) => {
        this.showSuccessMessage(true);
        if (callback) {
          setTimeout(() => {
            callback();
          }, 500);
        }
      })
      .catch((e) => {
        this.showSuccessMessage(false);
      });
  }

  printOrder() {
    this.saveOrder(() => {
      window.print();
    });
  }

  toggleNote() {
    this.showNote = !this.showNote;
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

  isWeighted(o) {
    try {
      return o.metric.toLowerCase() == units.KG ||
        o.metric.toLowerCase() == units.GRAM
        ? true
        : false;
    } catch (e) {
      console.log('Error in ' + o.name, e);
    }
  }

  orderStatusChanged(event) {
    this.order.status = event.currentTarget.checked ? 'accepted' : 'open';
  }
}
