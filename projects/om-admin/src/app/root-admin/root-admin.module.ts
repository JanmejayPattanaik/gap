import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RootAdminComponent } from './root-admin.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: RootAdminComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class RootAdminModule {}
