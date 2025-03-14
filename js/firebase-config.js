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

// 添加匿名身份验证
firebase.auth().signInAnonymously()
  .then(() => {
    console.log("匿名登录成功");
  })
  .catch((error) => {
    console.error("匿名登录失败:", error);
  });

// 监听身份验证状态变化
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // 用户已登录
    console.log("用户已登录:", user.uid);
  } else {
    // 用户已登出
    console.log("用户未登录，尝试重新进行匿名登录");
    firebase.auth().signInAnonymously()
      .catch((error) => {
        console.error("重新匿名登录失败:", error);
      });
  }
});