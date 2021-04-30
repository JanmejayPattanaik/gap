import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sku-details',
  templateUrl: './sku-details.component.html',
  styleUrls: ['./sku-details.component.scss'],
})
export class SkuDetailsComponent implements OnInit {
  data: {vendorName: '', productName: '', vendorSKUs: ''};
  constructor(private router: Router) {
    // this.route.params.subscribe((param) => {
    //   this.data = param.data;
    // });

    const state = this.router.getCurrentNavigation().extras.state;
    if (state && state.data) {
      this.data = { ...state.data };
    }
  }

  ngOnInit(): void {}
}
