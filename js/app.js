// 初始化变量
let cart = [];
let orders = [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载菜单
    loadMenu();
    
    // 绑定提交订单按钮事件
    document.getElementById('submit-order').addEventListener('click', submitOrder);
});

// 加载菜单函数
function loadMenu() {
    const menuContainer = document.getElementById('menu-items');
    const menuDescriptionContainer = document.getElementById('menu-description');
    
    // 清空容器
    menuContainer.innerHTML = '';
    
    // 加载菜单说明文字
    firebaseData.menu.getDescription(function(description) {
        // 提前设置样式，避免重排
        menuDescriptionContainer.style.whiteSpace = 'pre-line';
        menuDescriptionContainer.innerHTML = description || '欢迎光临哥村卤肉饭，我们提供正宗台式卤肉饭，选用上等食材，每日新鲜制作。';
    });

    // 从Firebase获取菜单数据
    firebaseData.menu.getItems(function(menuItems) {
        if (!menuItems || menuItems.length === 0) {
            menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">暂无菜单数据</p></div>';
            return;
        }
        
        // 遍历菜单项并创建卡片
        menuItems.forEach(item => {
            const menuItemElement = document.createElement('div');
            menuItemElement.className = 'col-md-6 col-lg-4';
            menuItemElement.innerHTML = `
                <div class="card menu-item">
                    <img src="${item.image}" class="card-img-top" alt="${item.name}">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text" style="white-space: pre-line;">${item.description}</p>
                        <p class="price">€${item.price.toFixed(2)}</p>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary add-to-cart w-100" data-id="${item.id}">添加到购物车</button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(menuItemElement);
        });
        
        // 绑定添加到购物车按钮事件
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                addToCart(itemId);
            });
        });
    });
}

// 添加到购物车函数
function addToCart(itemId) {
    // 从Firebase获取最新菜单数据
    firebaseData.menu.getItems(function(currentMenuItems) {
        // 查找菜单项
        const menuItem = currentMenuItems.find(item => item.id === itemId);
        
        if (!menuItem) return;
        
        // 检查购物车中是否已有该商品
        const existingItem = cart.find(item => item.id === itemId);
        
        if (existingItem) {
            // 如果已存在，增加数量
            existingItem.quantity += 1;
        } else {
            // 如果不存在，添加到购物车
            cart.push({
                id: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1
            });
        }
        
        // 更新购物车显示
        updateCartDisplay();
    });
    return; // 提前返回，因为后续代码已在回调函数中处理
    
    if (!menuItem) return;
    
    // 检查购物车中是否已有该商品
    const existingItem = cart.find(item => item.id === itemId);
    
    if (existingItem) {
        // 如果已存在，增加数量
        existingItem.quantity += 1;
    } else {
        // 如果不存在，添加到购物车
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
        });
    }
    
    // 更新购物车显示
    updateCartDisplay();
}

// 更新购物车显示函数
function updateCartDisplay() {
    const orderItemsContainer = document.getElementById('order-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    
    // 清空容器
    orderItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        // 如果购物车为空
        orderItemsContainer.innerHTML = '<p class="text-muted">您的购物车是空的</p>';
        totalPriceElement.textContent = '€0.00';
        checkoutButton.disabled = true;
        return;
    }
    
    // 计算总价
    let totalPrice = 0;
    
    // 遍历购物车项并创建元素
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalPrice += itemTotal;
        
        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'order-item';
        orderItemElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.name}</span>
                <span class="price">€${item.price.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <div class="quantity-control">
                    <button class="decrease-quantity" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-quantity" data-id="${item.id}">+</button>
                </div>
                <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">删除</button>
            </div>
        `;
        orderItemsContainer.appendChild(orderItemElement);
    });
    
    // 更新总价显示
    totalPriceElement.textContent = `€${totalPrice.toFixed(2)}`;
    
    // 启用结账按钮
    checkoutButton.disabled = false;
    
    // 绑定数量控制按钮事件
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            decreaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            increaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            removeFromCart(itemId);
        });
    });
}

// 减少商品数量函数
function decreaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    
    if (cartItem) {
        cartItem.quantity -= 1;
        
        if (cartItem.quantity <= 0) {
            // 如果数量为0，从购物车中移除
            removeFromCart(itemId);
        } else {
            // 更新购物车显示
            updateCartDisplay();
        }
    }
}

// 增加商品数量函数
function increaseQuantity(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    
    if (cartItem) {
        cartItem.quantity += 1;
        // 更新购物车显示
        updateCartDisplay();
    }
}

// 从购物车中移除商品函数
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    // 更新购物车显示
    updateCartDisplay();
}

// 生成订单ID
function generateOrderId() {
    // 从Firebase获取所有订单
    return new Promise((resolve) => {
        firebaseData.orders.getAll(function(allOrders) {
            // 找出最大的序号
            let maxNumber = 0;
            allOrders.forEach(order => {
                // 尝试将订单ID解析为数字
                const orderNumber = parseInt(order.id);
                if (!isNaN(orderNumber) && orderNumber > maxNumber) {
                    maxNumber = orderNumber;
                }
            });
            
            // 生成新的序号，从001开始
            const newNumber = (maxNumber + 1).toString().padStart(3, '0');
            resolve(newNumber);
        });
    });
}

// 提交订单函数
async function submitOrder() {
    // 获取表单数据
    const groupNickname = document.getElementById('group-nickname').value;
    
    // 验证必填字段
    if (!groupNickname) {
        alert('请填写群昵称');
        return;
    }
    
    // 计算总价
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        // 生成订单ID
        const orderId = await generateOrderId();
        
        // 创建订单对象
        const order = {
            id: orderId,
            customer: {
                name: groupNickname,
                phone: "",
                address: ""
            },
            items: [...cart],
            totalPrice: totalPrice,
            note: "",
            deliveryTime: "asap",
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        // 使用Firebase保存订单
        firebaseData.orders.save(order, function(success, orderId) {
            if (success) {
                // 显示订单成功模态框
                document.getElementById('order-id').textContent = orderId || order.id;
                
                // 获取后台设置的取餐时间
                const pickupTime = localStorage.getItem('pickupTimeSetting') || '30';
                document.getElementById('pickup-time').textContent = `${pickupTime}分钟后`;
                
                const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
                if (orderModal) orderModal.hide();
                const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                successModal.show();
                
                // 清空购物车
                cart = [];
                updateCartDisplay();
                
                // 重置表单
                document.getElementById('order-form').reset();
            } else {
                alert('订单提交失败，请重试');
            }
        });
    } catch (error) {
        console.error('生成订单ID失败:', error);
        alert('订单提交失败，请重试');
    }
}

// 保存订单到本地存储
function saveOrdersToLocalStorage() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// 从本地存储加载订单
function loadOrdersFromLocalStorage() {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// 页面加载时从本地存储加载订单
loadOrdersFromLocalStorage();