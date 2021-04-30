import {Component, NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {OrderListComponent} from './order-list/order-list.component';
import {ReceiptComponent} from './receipt/receipt.component';
import {CanLoadService} from './guards/can-load.service'

// fixes a bug where setting route into modal outlet cannot be reused, as the
// route remains activated after closing the dialog
@Component({template: ''})
export class EmptyComponent {}
// ----------------------------------

export const routes : Routes = [
  // {   path: 'orders',   component: OrderListComponent },
  {
    path: 'orders',
    loadChildren: () => import ('./order-list/order-list.module').then((m) => m.OrderListModule)
  }, {
    path: 'invoice',
    component: ReceiptComponent
  }, {
    path: 'addproduct',
    loadChildren: () => import ('./add-product/add-product.module').then((m) => m.AddProductModule)
  }, {
    path: 'addorder',
    loadChildren: () => import ('./add-order/add-order.module').then((m) => m.AddOrderModule)
  }, {
    path: 'rootadmin',
    loadChildren: () => import ('./root-admin/root-admin.module').then((m) => m.RootAdminModule)
  }, {
    path: 'stock',
    loadChildren: () => import ('./stock/stock.module').then((m) => m.StockModule),
    pathMatch: 'full'
  }, {
    path: 'sku',
    loadChildren: () => import ('./sku-details/sku-details.module').then((m) => m.SkuDetailsModule)
  }, {
    path: 'login',
    loadChildren: () => import ('./login/login.module').then((m) => m.LoginModule)
  }, {
    path: 'messaging',
    loadChildren: () => import ('./messaging/messaging.module').then((m) => m.MessagingModule),
    canActivate: [CanLoadService]
  }, {
    path: 'subscriptions',
    loadChildren: () => import ('./subscription/subscription.module').then((m) => m.SubscriptionModule),
    canActivate: [CanLoadService]
  }, {
    path: 'subscription-form',
    loadChildren: () => import ('./subscription-form/subscription-form.module').then((m) => m.SubscriptionFormModule)
  }, {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }, {
    path: '',
    outlet: 'modal',
    component: EmptyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}