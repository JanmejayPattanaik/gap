// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`. The
// list of file replacements can be found in `angular.json`. export const
// environment = {   production: false,   firebaseConfig: {     apiKey:
// 'AIzaSyALLRbtbWo1NMgfmNLa5rqEeImVF620r7c',     authDomain:
// 'organics-mantra.firebaseapp.com',     databaseURL:
// 'https://organics-mantra.firebaseio.com',     projectId: 'organics-mantra',
//   storageBucket: 'organics-mantra.appspot.com',     messagingSenderId:
// '551513480510',     appId: '1:551513480510:web:36dac9ec807aeaf367206f',
// measurementId: 'G-7GM7JSLQ8K',   },   urls: {     subscribeToLocalityTopic:
//
// 'http://localhost:5001/organics-mantra/us-central1/subscribeToLocalityTopic',
//     sendNotificationToTopic:
// 'http://localhost:5001/organics-mantra/us-central1/sendNotificationToTopic',
//  }, };

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyDNKZzJUrQ2MRq-hLyuSnRJZTKw-2XmoHk",
    authDomain: "green-avocado-partners.firebaseapp.com",
    projectId: "green-avocado-partners",
    storageBucket: "green-avocado-partners.appspot.com",
    messagingSenderId: "212254343452",
    appId: "1:212254343452:web:abdda8b82c7dbd977b7ad9",
    measurementId: "G-EFEKT2Y5ZE"
  },
  urls: {
    subscribeToLocalityTopic: 'http://localhost:5001/organics-mantra/us-central1/subscribeToLocalityTopic',
    sendNotificationToTopic: 'http://localhost:5001/organics-mantra/us-central1/sendNotificationToTopic'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.