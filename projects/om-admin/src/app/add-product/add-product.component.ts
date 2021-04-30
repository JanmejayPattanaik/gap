import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  Input,
  Output
} from '@angular/core';
import {FormControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask} from '@angular/fire/storage';
import {ProductService} from './../services/product.service';
import * as firebase from 'firebase';
import {Observable, Subscription} from 'rxjs';
import {finalize, map, take} from 'rxjs/operators';
import {MatTableDataSource} from '@angular/material/table';

enum MODE {
  new = 0,
  edit = 1
}

@Component({selector: 'app-add-product', templateUrl: './add-product.component.html', styleUrls: ['./add-product.component.scss']})
export class AddProductComponent implements OnInit,
OnDestroy {
  products : any;
  selectedProduct : any;
  selectedCategory : any;
  productForm : FormGroup;
  mode : MODE = MODE.new;
  saveStatus : number;
  categories : Map < string,
  string > = new Map();
  subCategories : Array < string > = [];

  ref : AngularFireStorageReference;
  task : AngularFireUploadTask;
  taskSub : Subscription;
  uploadProgress : Observable < number >;
  downloadURL : string;
  @ViewChild('image')image;

  constructor(private formBuilder : FormBuilder, private db : AngularFirestore, private afStorage : AngularFireStorage, private productService : ProductService) {
    this
      .productService
      .getCategories()
      .subscribe((d) => {
        d
          ?.forEach((item) => {
            this
              .categories
              .set(item.id, item);
          });
      });
  }

  ngOnInit() : void {
    this.initNewProduct();
    this.initForm();

    // this.products = this.db   .collection('/products')   .valueChanges({ idField:
    // 'id' });
    this.products = this.productService.products;
    console.log();
  }

  private initNewProduct() {
    this.mode = MODE.new;

    this.selectedProduct = {
      id: '',
      name: '',
      description: '',
      imageUrl: '',
      price: 0,
      quantity: 1,
      vendor: '',
      category: '',
      subCategory: '',
      isActive: true,
      canSubscribe: false,
      priority: 1,
      isPacked: true,
      unitSize: 0,
      metric: ''
    };
  }

  private initForm() {
    this.productForm = this
      .formBuilder
      .group({
        name: [
          this.selectedProduct.name,
          [Validators.required]
        ],
        description: [this.selectedProduct.description, []
        ],
        // imageUrl: ['#', []],
        price: [
          this.selectedProduct.price,
          [Validators.required]
        ],
        quantity: [
          this.selectedProduct.quantity,
          [Validators.required]
        ],
        subscribe: [
          this
            .selectedProduct
            .canSubscribe
            .toString() || 'false',
          [Validators.required]
        ],
        packed: [
          (this.selectedProduct.isPacked || false).toString(),
          [Validators.required]
        ],
        unitSize: [
          this.selectedProduct.unitSize,
          [Validators.required]
        ],
        metric: [
          this.selectedProduct.metric,
          [Validators.required]
        ],
        active: [
          this
            .selectedProduct
            .isActive
            .toString() || 'true',
          [Validators.required]
        ],
        category: [
          this.selectedProduct.category.id,
          [Validators.required]
        ],
        subCategory: [this.selectedProduct.subCategory],
        vendor: [
          this.selectedProduct.vendor,
          [Validators.required]
        ]
      });

    this.downloadURL = this.selectedProduct.imageUrl;
  }

  setSubCategoryValidator() {
    if (this.subCategories.length > 0) {
      this
        .productForm
        .get('subCategory')
        .setValidators(Validators.required);
    } else {
      this
        .productForm
        .get('subCategory')
        .clearValidators();
    }
  }

  submitForm() {
    if (!this.productForm.valid) {
      console.log('Please provide all the required values!');
      this.showSuccessMessage(false);
      return false;
    } else {
      const o = this.productForm.value;
      const cat : any = this
        .categories
        .get(o.category);
      let product = {
        name: o.name,
        description: o.description,
        // imageUrl: this.image?.nativeElement.getAttribute('src') || '',
        imageUrl: '',
        price: o.price,
        quantity: o.quantity,
        vendor: o.vendor,
        category: {
          id: cat.id,
          name: cat.name
        },
        subCategory: o.subCategory,
        isActive: o.active == 'true',
        canSubscribe: o.subscribe == 'true',
        priority: this.selectedProduct
          ? this.selectedProduct.priority
          : 1,
        isPacked: o.packed == 'true',
        unitSize: o.unitSize,
        metric: o.metric
      };

      if (this.mode == MODE.new) {
        let p = {
          ...product,
          createdAt: firebase
            .firestore
            .FieldValue
            .serverTimestamp()
        };
        this
          .db
          .collection('/products')
          .add(p)
          .then((d) => {
            this.initNewProduct();
            this.initForm();
            this.showSuccessMessage(true);
          });
      } else if (this.mode == MODE.edit) {
        let p = {
          ...product,
          updatedAt: firebase
            .firestore
            .FieldValue
            .serverTimestamp()
        };
        this
          .db
          .collection('/products')
          .doc(this.selectedProduct.id)
          .set(p, {merge: true})
          .then((d) => {
            this.initNewProduct();
            this.initForm();
            this.showSuccessMessage(true);
          });
      }
      console.log('All good');
    }
  }

  addNew() {
    this.mode = MODE.new;
    this.initNewProduct();
    this.initForm();
  }

  editProduct(product) {
    this.mode = MODE.edit;
    this.selectedProduct = product;
    this.selectedCategory = this.selectedProduct.category.id;
    this.setSubCategories();
    this.initForm();
    window.scroll(0, 160);
  }

  deleteProduct(product) {
    this.selectedProduct = product;
    this
      .db
      .collection('/products')
      .doc(this.selectedProduct.id)
      .delete();
  }

  private showSuccessMessage(flag : boolean) {
    if (flag) {
      this.saveStatus = 1;
    } else {
      this.saveStatus = 0;
    }
    setTimeout(() => {
      this.saveStatus = -1;
    }, 3500);
  }

  packedChanged(event) {
    this.selectedProduct.isPacked = event.value == 'true';
  }

  getIsPacked() {
    return this.selectedProduct.isPacked
      ? 'disable'
      : null;
  }

  onCategoryChange() {
    console.log("onCategoryChange ::: ", this.selectedCategory);
    // this.selectedCategory = categoryName;
    this.setSubCategories();
  }

  uploadImage(event) {
    // create a random id
    if (event.target.files[0].size > 204800) {
      alert('Choose an image smaller than 200KB');
      return;
    }

    const randomId = Math
      .random()
      .toString(36)
      .substring(2);
    // create a reference to the storage bucket location
    this.ref = this
      .afStorage
      .ref('/products/' + randomId);
    // the put method creates an AngularFireUploadTask and kicks off the upload
    this.task = this
      .ref
      .put(event.target.files[0]);

    // AngularFireUploadTask provides observable to get uploadProgress value
    // this.uploadProgress = this.task.snapshotChanges() .pipe(map(s =>
    // (s.bytesTransferred / s.totalBytes) * 100)); observe upload progress
    this.uploadProgress = this
      .task
      .percentageChanges();
    // get notified when the download URL is available
    if (this.taskSub) 
      this.taskSub.unsubscribe();
    this.taskSub = this
      .task
      .snapshotChanges()
      .pipe(finalize(() => this.ref.getDownloadURL().pipe(take(1)).subscribe((d) => {
        this.downloadURL = d;
      })))
      .subscribe();
  }

  private setSubCategories() {
    this.subCategories = [];
    this
      .categories
      .forEach((x : any) => {
        if (x.id === this.selectedCategory && x.subCategory) {
          this.subCategories = [...x.subCategory];
        }
      });
    this.setSubCategoryValidator();
  }

  ngOnDestroy() {
    if (this.taskSub) 
      this.taskSub.unsubscribe();
    }
  }
