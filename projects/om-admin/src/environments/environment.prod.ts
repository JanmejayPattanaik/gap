export const environment = {
  production: true,
  firebaseConfig: {
    apiKey: "AIzaSyALLRbtbWo1NMgfmNLa5rqEeImVF620r7c",
    authDomain: "organics-mantra.firebaseapp.com",
    databaseURL: "https://organics-mantra.firebaseio.com",
    projectId: "organics-mantra",
    storageBucket: "organics-mantra.appspot.com",
    messagingSenderId: "551513480510",
    appId: "1:551513480510:web:36dac9ec807aeaf367206f",
    measurementId: "G-7GM7JSLQ8K",
  },
  urls: {
    subscribeToLocalityTopic:
      'https://us-central1-organics-mantra.cloudfunctions.net/subscribeToLocalityTopic',
    sendNotificationToTopic:
      'https://us-central1-organics-mantra.cloudfunctions.net/sendNotificationToTopic',
  },
};
