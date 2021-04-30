import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SkuDetailsComponent } from './sku-details.component';

const routes: Routes = [
  {
    path: '',
    component: SkuDetailsComponent,
    // outlet: 'modal',
  },
];

@NgModule({
  declarations: [SkuDetailsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SkuDetailsModule {}
