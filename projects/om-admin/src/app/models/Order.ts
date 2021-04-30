export class Order {
  id?: string;
  createdAt: firebase.firestore.FieldValue;
  cart: any;
  userDetails: any;
  status: string;
  total?: number;
  notes?: string;
  adjustedAmount?: number = 0;
  deleted: boolean;
  updatedAt: firebase.firestore.FieldValue;
  deliveryDate: Date;
  isManual: boolean

  constructor(id, cart, userDetails, status, total, notes) {
    this.id = id;
    this.cart = cart;
    this.userDetails = userDetails;
    this.status = status;
    this.total = total;
    this.notes = notes;
  }
}
