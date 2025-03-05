// Firebase数据操作函数
const firebaseData = {
  // 菜单相关操作
  menu: {
    // 获取菜单说明
    getDescription: function(callback) {
      database.ref('menuDescription').once('value')
        .then((snapshot) => {
          const description = snapshot.val() || '';
          callback(description);
        })
        .catch((error) => {
          console.error("获取菜单说明失败:", error);
          callback('');
        });
    },
    
    // 保存菜单说明
    saveDescription: function(description, callback) {
      database.ref('menuDescription').set(description)
        .then(() => {
          callback(true);
        })
        .catch((error) => {
          console.error("保存菜单说明失败:", error);
          callback(false);
        });
    },
    
    // 获取所有菜单项
    getItems: function(callback) {
      database.ref('menuItems').once('value')
        .then((snapshot) => {
          const items = snapshot.val() || {};
          callback(Object.values(items));
        })
        .catch((error) => {
          console.error("获取菜单项失败:", error);
          callback([]);
        });
    },
    
    // 保存菜单项
    saveItem: function(item, callback) {
      const itemRef = database.ref('menuItems/' + item.id);
      itemRef.set(item)
        .then(() => {
          callback(true);
        })
        .catch((error) => {
          console.error("保存菜单项失败:", error);
          callback(false);
        });
    },
    
    // 删除菜单项
    deleteItem: function(itemId, callback) {
      database.ref('menuItems/' + itemId).remove()
        .then(() => {
          callback(true);
        })
        .catch((error) => {
          console.error("删除菜单项失败:", error);
          callback(false);
        });
    }
  },
  
  // 订单相关操作
  orders: {
    // 获取所有订单
    getAll: function(callback) {
      database.ref('orders').once('value')
        .then((snapshot) => {
          const orders = snapshot.val() || {};
          callback(Object.values(orders));
        })
        .catch((error) => {
          console.error("获取订单失败:", error);
          callback([]);
        });
    },
    
    // 监听新订单
    listenForNew: function(callback) {
      const ordersRef = database.ref('orders');
      ordersRef.on('child_added', (snapshot) => {
        const newOrder = snapshot.val();
        callback(newOrder);
      });
      return ordersRef; // 返回引用以便后续可以取消监听
    },
    // 保存订单
    save: function(order, callback, retryCount = 0) {
      const maxRetries = 3;
      const retryDelay = 1500;

      // 检查用户是否已登录
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.log("用户未登录，正在尝试匿名登录...");
        // 尝试重新登录
        firebase.auth().signInAnonymously()
          .then(() => {
            console.log("匿名登录成功，等待认证状态更新...");
            // 增加延迟以确保认证状态完全更新
            setTimeout(() => this.save(order, callback, retryCount), retryDelay);
          })
          .catch((error) => {
            console.error("匿名登录失败:", error);
            if (retryCount < maxRetries) {
              console.log(`登录重试 ${retryCount + 1}/${maxRetries}...`);
              setTimeout(() => this.save(order, callback, retryCount + 1), retryDelay);
            } else {
              console.error("达到最大重试次数，保存订单失败");
              callback(false);
            }
          });
        return;
      }
      
      const orderRef = database.ref('orders/' + order.id);
      orderRef.set(order)
        .then(() => {
          console.log("订单保存成功:", order.id);
          callback(true, order.id);
        })
        .catch((error) => {
          console.error("保存订单失败:", error);
          if (retryCount < maxRetries) {
            console.log(`保存重试 ${retryCount + 1}/${maxRetries}...`);
            setTimeout(() => this.save(order, callback, retryCount + 1), retryDelay);
          } else {
            console.error("达到最大重试次数，保存订单失败");
            callback(false);
          }
        });
    },
    // 更新订单状态
    updateStatus: function(orderId, status, callback) {
      const updates = {};
      updates['/orders/' + orderId + '/status'] = status;
      database.ref().update(updates)
        .then(() => {
          callback(true);
        })
        .catch((error) => {
          console.error("更新订单状态失败:", error);
          callback(false);
        });
    }
  },
  
  // 数据迁移
  migrate: {
    // 从localStorage迁移数据到Firebase
    fromLocalStorage: function(callback) {
      try {
        // 迁移菜单说明
        const menuDescription = localStorage.getItem('menuDescription') || '';
        database.ref('menuDescription').set(menuDescription);
        
        // 迁移菜单项
        const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
        const menuItemsObj = {};
        menuItems.forEach(item => {
          menuItemsObj[item.id] = item;
        });
        database.ref('menuItems').set(menuItemsObj);
        
        // 迁移订单
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const ordersObj = {};
        orders.forEach(order => {
          ordersObj[order.id] = order;
        });
        database.ref('orders').set(ordersObj);
        
        callback(true);
      } catch (error) {
        console.error("数据迁移失败:", error);
        callback(false);
      }
    }
  }
};