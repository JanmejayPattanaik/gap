import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import * as firebase from 'firebase';
import { filter, take } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ProductService } from '../services/product.service';
import { AutoUnsub } from '../shared/AutoUnsub';

@AutoUnsub()
@Component({
  selector: 'app-messaging',
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit {
  messaging = firebase.messaging();

  messagingForm: FormGroup;
  title: string;
  message: string;

  localities: string[];
  selectedTopics: Array<string>;
  saveStatus: number;
  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService
      .getLocalities()
      .pipe(filter(Boolean))
      .pipe(take(1))
      .subscribe((d: Array<string>) => {
        this.localities = [...d];
      });

    // Add the public key generated from the console here.
    // this.registerForNotifications();

    this.initForm();
  }

  private registerForNotifications() {
    this.messaging
      .getToken({
        vapidKey:
          'BJJRan_x21veSXL-4Q_Y04XCzthf9HY8cV-67mmUqtwRWAFYR-lsPTNOtVKQytcTk37yAN7wcZAqpfgPtHZd980',
      })
      .then((currentToken) => {
        if (currentToken) {
          console.log('token retrieved: ' + currentToken);
        } else {
          // Show permission request.
          console.log(
            'No registration token available. Request permission to generate one.'
          );
          // Show permission UI.
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        // showToken('Error retrieving registration token. ', err);
        // setTokenSentToServer(false);
      });
  }

  private initForm() {
    this.messagingForm = this.formBuilder.group({
      topics: [[]],
      title: [''],
      message: [''],
    });
  }

  submitForm() {
    console.log(this.messagingForm);
    
    // {headers: {
    //   'Access-Control-Allow-Origin': '*'
    // }} 
    this.http
      .post(
        environment.urls.sendNotificationToTopic,
        this.generateMessagePayload(this.messagingForm.value)            
      )
      .subscribe((res) => {
        this.showSuccessMessage(true);
      }, error => {
        this.showSuccessMessage(false);
      });
  }

  showSuccessMessage(flag: boolean) {
    if (flag) {
      this.saveStatus = 1;
    } else {
      this.saveStatus = 0;
    }
    setTimeout(() => {
      this.saveStatus = -1;
    }, 3500);
  }

  generateMessagePayload(data) {
    let message: any = {
      notification: {
        body: data.message,
        title: data.title,
      },
    };
    if (data.topics.length > 1) {
      const condition = this.generateConditionRecurse('', data.topics);
      message = {
        ...message,
        condition: condition,
      };
    } else {
      message = {
        ...message,
        topic: data.topics[0].replace(/\s/g, '-'),
      };
    }
    return message;
  }

  generateConditionRecurse(condition, topics) {
    if(topics.length === 1) {
      condition += `'${topics[0].replace(/\s/g, '-')}' in topics`
      return condition;
    }
    condition += `'${topics.shift().replace(/\s/g, '-')}' in topics || `;
    return this.generateConditionRecurse(condition, topics);
  }
}
