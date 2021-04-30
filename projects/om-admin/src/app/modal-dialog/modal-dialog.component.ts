import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.scss'],
})
export class ModalDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ModalDialogComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    const navigationExtras: NavigationExtras = {
      state: {
        data: this.data,
      },
    };
    this.router.navigate([{ outlets: { modal: ['sku'] } }], navigationExtras);
  }
}
