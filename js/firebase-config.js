// Firebase配置信息
const firebaseConfig = {
  apiKey: "AIzaSyCov462B_0Vn4wtrFEqyF_qRMfgL-ER9Fw",
  authDomain: "gclrf-c7aed.firebaseapp.com",
  databaseURL: "https://gclrf-c7aed-default-rtdb.europe-west1.firebasedatabase.app",
 projectId: "gclrf-c7aed",
 storageBucket: "gclrf-c7aed.firebasestorage.app",
messagingSenderId: "1007373321309",
 appId: "1:1007373321309:web:055ae6d1c155790f6379b4",
measurementId: "G-XZM2550T33"
  };
  

// 初始化Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();