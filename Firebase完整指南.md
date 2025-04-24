# Firebase完整指南

本指南整合了Firebase部署、实施和步骤指南，提供了从创建Firebase项目到完成数据迁移的完整流程。

## 1. 准备工作

### 1.1 创建Firebase账号和项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 使用Google账号登录
3. 点击「创建项目」
4. 项目名称输入「哥村卤肉饭」
5. 按照提示完成项目创建（可以选择不启用Google Analytics）

### 1.2 启用Realtime Database

1. 在Firebase控制台左侧菜单中选择「构建」→「Realtime Database」
2. 点击「创建数据库」
3. 选择数据库位置（建议选择亚洲区域，如东京或新加坡）
4. 在安全规则配置中，选择「测试模式」，点击「启用」

### 1.3 获取Firebase配置

1. 在Firebase控制台中点击⚙️图标，选择「项目设置」
2. 在「通用」标签页下找到「您的应用」部分
3. 点击网页图标</>添加Web应用
4. 注册应用名称（如：gocun-luroufan-web）
5. 复制生成的配置代码，它看起来像这样：

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 2. 代码实施

### 2.1 创建必要的文件

#### 2.1.1 创建Firebase配置文件

创建`js/firebase-config.js`文件，将您获取的Firebase配置信息填入：

```javascript
// Firebase配置信息
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
```

#### 2.1.2 创建Firebase数据操作文件

创建`js/firebase-data.js`文件，实现数据操作功能：

```javascript
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
    save: function(order, callback) {
      const orderRef = database.ref('orders/' + order.id);
      orderRef.set(order)
        .then(() => {
          callback(true, order.id);
        })
        .catch((error) => {
          console.error("保存订单失败:", error);
          callback(false);
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
```

### 2.2 修改前台页面（index.html）

1. 在`</body>`标签前添加Firebase SDK：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>

<!-- Firebase配置和数据操作 -->
<script src="js/firebase-config.js"></script>
<script src="js/firebase-data.js"></script>
<script src="js/main.js"></script>
```

2. 创建`js/main.js`文件，实现前台功能：

```javascript
// 加载菜单说明
function loadMenuDescription() {
  firebaseData.menu.getDescription(function(description) {
    document.getElementById('menu-description').textContent = description;
  });
}

// 加载菜单项
function loadMenuItems() {
  firebaseData.menu.getItems(function(items) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';
    
    if (items.length === 0) {
      menuContainer.innerHTML = '<p class="text-center text-muted">暂无菜单项</p>';
      return;
    }
    
    items.forEach(item => {
      const itemElement = createMenuItemElement(item);
      menuContainer.appendChild(itemElement);
    });
  });
}

// 提交订单
document.getElementById('submit-order').addEventListener('click', function() {
  // 获取订单信息...
  
  // 使用Firebase保存订单
  firebaseData.orders.save(order, function(success, orderId) {
    if (success) {
      // 显示订单成功信息
      document.getElementById('order-id').textContent = orderId;
      $('#successModal').modal('show');
      // 清空购物车
      cart = [];
      updateCartDisplay();
    } else {
      alert('订单提交失败，请重试');
    }
  });
});

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  loadMenuDescription();
  loadMenuItems();
});
```

### 2.3 修改后台管理页面（admin.html）

1. 在`</body>`标签前添加Firebase SDK（同前台页面）

2. 创建`js/admin.js`文件，实现后台管理功能：

```javascript
// 加载菜单说明
function loadMenuDescription() {
  firebaseData.menu.getDescription(function(description) {
    document.getElementById('menu-description-text').value = description;
  });
}

// 保存菜单说明
document.getElementById('save-menu-description').addEventListener('click', function() {
  const description = document.getElementById('menu-description-text').value;
  firebaseData.menu.saveDescription(description, function(success) {
    if (success) {
      alert('菜单说明保存成功');
    } else {
      alert('菜单说明保存失败');
    }
  });
});

// 加载菜单项
function loadMenuItems() {
  firebaseData.menu.getItems(function(items) {
    const menuTable = document.querySelector('#menu-content table tbody');
    menuTable.innerHTML = '';
    
    if (items.length === 0) {
      menuTable.innerHTML = '<tr><td colspan="6" class="text-center">暂无菜单项</td></tr>';
      return;
    }
    
    items.forEach(item => {
      const row = createMenuItemRow(item);
      menuTable.appendChild(row);
    });
  });
}

// 加载订单
function loadOrders(filter = 'all') {
  firebaseData.orders.getAll(function(orders) {
    if (filter !== 'all') {
      orders = orders.filter(order => order.status === filter);
    }
    displayOrders(orders);
  });
}

// 数据迁移
document.getElementById('migrate-data').addEventListener('click', function() {
  if (confirm('确定要将本地数据迁移到Firebase吗？这将覆盖Firebase中的现有数据。')) {
    firebaseData.migrate.fromLocalStorage(function(success) {
      if (success) {
        alert('数据迁移成功！');
        loadMenuDescription();
        loadMenuItems();
        loadOrders();
      } else {
        alert('数据迁移失败，请查看控制台错误信息。');
      }
    });
  }
});
```

## 3. 数据迁移

1. 在后台管理页面添加数据迁移按钮：

```html
<div class="card mb-4">
  <div class="card-header">
    <h5 class="mb-0">数据迁移</h5>
  </div>
  <div class="card-body">
    <p>将本地存储的数据迁移到Firebase数据库</p>
    <button class="btn btn-warning" id="migrate-data">开始迁移</button>
  </div>
</div>
```

2. 使用`firebaseData.migrate.fromLocalStorage`函数执行迁移

## 4. 安全性配置

在Firebase控制台中配置数据库安全规则：

```json
{
  "rules": {
    "menuItems": {
      ".read": true,
      ".write": true
    },
    "menuDescription": {