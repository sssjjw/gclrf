// 增强版前台购物车系统 - 修复版本
let cart = [];
let orders = [];
let retryCount = 0;
const maxRetries = 5;

// 等待Firebase初始化完成
function waitForFirebase(callback, attempts = 0) {
    if (attempts > 10) {
        console.error('❌ Firebase初始化超时');
        return;
    }
    
    if (typeof firebase !== 'undefined' && 
        typeof database !== 'undefined' && 
        typeof firebaseData !== 'undefined') {
        console.log('✅ Firebase组件已就绪');
        callback();
    } else {
        console.log(`⏳ 等待Firebase初始化... (${attempts + 1}/10)`);
        setTimeout(() => waitForFirebase(callback, attempts + 1), 500);
    }
}

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 前台页面DOM加载完成，初始化购物车系统...');
    
    waitForFirebase(function() {
        console.log('🔧 开始初始化前台系统...');
        
        // 检查用户认证状态
        checkAuthAndInitialize();
        
        // 绑定静态事件
        bindStaticEvents();
    });
});

// 检查认证状态并初始化
function checkAuthAndInitialize() {
    console.log('🔐 检查Firebase认证状态...');
    
    // 直接尝试匿名登录，不等待状态变化
    firebase.auth().signInAnonymously()
        .then(() => {
            console.log('✅ 匿名登录成功');
            setTimeout(initializeSystem, 1000);
        })
        .catch((error) => {
            console.error('❌ 匿名登录失败:', error);
            if (retryCount < maxRetries) {
                retryCount++;
                console.log(`🔄 重试登录 ${retryCount}/${maxRetries}...`);
                setTimeout(checkAuthAndInitialize, 2000);
            } else {
                console.error('达到最大重试次数，系统可能无法正常工作');
                // 即使登录失败，也尝试加载菜单
                initializeSystem();
            }
        });
}

// 初始化系统
function initializeSystem() {
    console.log('🔄 开始加载前台数据...');
    
    try {
        // 加载菜单
        loadMenu();
        
        console.log('✅ 前台系统初始化完成');
    } catch (error) {
        console.error('❌ 前台系统初始化失败:', error);
    }
}

// 绑定静态事件
function bindStaticEvents() {
    console.log('🔗 绑定静态事件...');
    
    // 绑定提交订单按钮事件
    const submitOrderBtn = document.getElementById('submit-order');
    if (submitOrderBtn) {
        submitOrderBtn.addEventListener('click', submitOrder);
        console.log('✅ 提交订单按钮事件已绑定');
    } else {
        console.warn('⚠️ submit-order 按钮不存在');
    }
    
    // 绑定结账按钮事件，在打开模态框时更新订单摘要
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            console.log('🛒 结账按钮被点击');
            updateOrderSummary();
        });
        console.log('✅ 结账按钮事件已绑定');
    } else {
        console.warn('⚠️ checkout-btn 按钮不存在');
    }
    
    // 绑定悬浮订单结账按钮事件
    const floatingCheckoutBtn = document.getElementById('floating-checkout-btn');
    if (floatingCheckoutBtn) {
        floatingCheckoutBtn.addEventListener('click', function() {
            console.log('🛒 悬浮结账按钮被点击');
            updateOrderSummary();
        });
        console.log('✅ 悬浮结账按钮事件已绑定');
    } else {
        console.warn('⚠️ floating-checkout-btn 按钮不存在');
    }
    
    // 绑定悬浮订单折叠/展开事件
    const toggleOrderBtn = document.getElementById('toggle-order');
    if (toggleOrderBtn) {
        toggleOrderBtn.addEventListener('click', function() {
            console.log('📱 悬浮订单切换按钮被点击');
            const floatingOrder = document.getElementById('floating-order');
            if (floatingOrder) {
                floatingOrder.classList.toggle('collapsed');
            }
        });
        console.log('✅ 悬浮订单切换事件已绑定');
    } else {
        console.warn('⚠️ toggle-order 按钮不存在');
    }
    
    console.log('✅ 静态事件绑定完成');
}

// 加载菜单函数（增强版）
function loadMenu() {
    console.log('📥 开始加载菜单...');
    
    const menuContainer = document.getElementById('menu-items');
    const menuDescriptionContainer = document.getElementById('menu-description');
    
    if (!menuContainer) {
        console.error('❌ menu-items 容器不存在');
        return;
    }
    
    // 清空容器
    menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">正在加载菜单...</p></div>';
    
    // 加载菜单说明文字
    if (firebaseData && firebaseData.menu) {
        firebaseData.menu.getDescription(function(description) {
            if (menuDescriptionContainer) {
                menuDescriptionContainer.style.whiteSpace = 'pre-line';
                menuDescriptionContainer.innerHTML = description || '欢迎光临哥村卤肉饭，我们提供正宗台式卤肉饭，选用上等食材，每日新鲜制作。';
                console.log('✅ 菜单说明已加载');
            }
        });
    }

    // 从Firebase获取菜单数据
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">菜单加载失败，请刷新页面重试</p></div>';
        return;
    }
    
    firebaseData.menu.getItems(function(menuItems) {
        try {
            if (!menuItems || !Array.isArray(menuItems)) {
                console.warn('⚠️ 菜单数据为空或格式错误');
                menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">暂无菜单数据</p></div>';
                return;
            }
            
            console.log(`📋 获取到 ${menuItems.length} 个菜单项`);
            
            // 过滤出可见的菜单项
            const visibleMenuItems = menuItems.filter(item => item.visible !== false);
            console.log(`👁️ 其中 ${visibleMenuItems.length} 个可见`);
            
            if (visibleMenuItems.length === 0) {
                menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-muted">暂无可用菜单项</p></div>';
                return;
            }
            
            // 清空加载中的提示
            menuContainer.innerHTML = '';
            
            // 遍历可见的菜单项并创建卡片
            visibleMenuItems.forEach((item, index) => {
                try {
                    console.log(`🍽️ 创建菜单项 ${index + 1}: ${item.name} (ID: ${item.id})`);
                    
                    const menuItemElement = document.createElement('div');
                    menuItemElement.className = 'col-md-6 col-lg-4';
                    
                    // 安全的图片URL处理
                    const imageUrl = item.image || item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';
                    
                    menuItemElement.innerHTML = `
                        <div class="card menu-item">
                            <img src="${imageUrl}" class="card-img-top" alt="${item.name || '未知商品'}" onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
                            <div class="card-body">
                                <h5 class="card-title">${item.name || '未知商品'}</h5>
                                <p class="card-text" style="white-space: pre-line;">${item.description || '暂无描述'}</p>
                                <p class="price">€${(item.price || 0).toFixed(2)}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary add-to-cart w-100" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">添加到购物车</button>
                            </div>
                        </div>
                    `;
                    menuContainer.appendChild(menuItemElement);
                } catch (error) {
                    console.error(`❌ 创建菜单项失败 (索引 ${index}):`, error, item);
                }
            });
            
            // 绑定添加到购物车按钮事件
            bindAddToCartEvents();
            
            console.log('✅ 菜单加载完成');
        } catch (error) {
            console.error('❌ 处理菜单数据失败:', error);
            menuContainer.innerHTML = '<div class="col-12 text-center"><p class="text-danger">菜单加载失败，请刷新页面重试</p></div>';
        }
    });
}

// 绑定添加到购物车事件
function bindAddToCartEvents() {
    console.log('🔗 绑定添加到购物车事件...');
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log(`🔘 找到 ${addToCartButtons.length} 个添加到购物车按钮`);
    
    addToCartButtons.forEach((button, index) => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            
            const itemId = this.getAttribute('data-id');
            const itemName = this.getAttribute('data-name');
            const itemPrice = this.getAttribute('data-price');
            
            console.log(`🛒 添加到购物车按钮被点击 (按钮 ${index + 1})`);
            console.log(`📋 商品信息: ID=${itemId}, 名称=${itemName}, 价格=${itemPrice}`);
            
            // 验证数据
            if (!itemId) {
                console.error('❌ 商品ID为空');
                return;
            }
            
            // 调用添加到购物车函数
            addToCart(itemId, itemName, itemPrice, this);
        });
    });
    
    console.log('✅ 添加到购物车事件绑定完成');
}

// 添加到购物车函数（增强版）
function addToCart(itemId, itemName, itemPrice, buttonElement) {
    console.log(`🛍️ 开始添加商品到购物车: ${itemName} (ID: ${itemId})`);
    
    try {
        // 查找菜单项 - 使用传入的数据以避免Firebase调用
        let menuItem = null;
        
        if (itemName && itemPrice) {
            // 使用传入的数据
            menuItem = {
                id: itemId,
                name: itemName,
                price: parseFloat(itemPrice) || 0
            };
            console.log('📦 使用按钮数据创建菜单项:', menuItem);
        } else {
            // 从Firebase获取完整数据
            console.log('🔍 从Firebase获取菜单项数据...');
            
            if (!firebaseData || !firebaseData.menu) {
                console.error('❌ firebaseData.menu 不可用');
                return;
            }
            
            firebaseData.menu.getItems(function(currentMenuItems) {
                const foundItem = currentMenuItems.find(item => 
                    item.id.toString() === itemId.toString()
                );
                
                if (foundItem) {
                    addToCartLogic(foundItem, buttonElement);
                } else {
                    console.error(`❌ 找不到商品 ID: ${itemId}`);
                }
            });
            return; // 异步处理，直接返回
        }
        
        // 直接处理逻辑
        addToCartLogic(menuItem, buttonElement);
        
    } catch (error) {
        console.error('❌ 添加到购物车失败:', error);
    }
}

// 添加到购物车逻辑
function addToCartLogic(menuItem, buttonElement) {
    console.log('🔧 执行添加到购物车逻辑:', menuItem);
    
    if (!menuItem) {
        console.error('❌ 菜单项为空');
        return;
    }
    
    // 检查购物车中是否已有该商品 - 使用兼容的ID匹配
    let existingItem = cart.find(item => item.id.toString() === menuItem.id.toString());
    
    if (existingItem) {
        // 如果已存在，增加数量
        existingItem.quantity += 1;
        console.log(`📈 商品数量增加: ${existingItem.name} 数量=${existingItem.quantity}`);
    } else {
        // 如果不存在，添加到购物车
        const newItem = {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
        };
        cart.push(newItem);
        console.log(`➕ 新商品添加到购物车:`, newItem);
    }
    
    // 更新购物车显示
    updateCartDisplay();
    
    // 更新菜单项显示状态
    if (buttonElement) {
        buttonElement.innerHTML = '<i class="bi bi-check2"></i> 已加入购物车';
        buttonElement.classList.add('btn-success');
        buttonElement.classList.remove('btn-primary');
        console.log('✅ 按钮状态已更新');
    }
    
    console.log(`🎉 商品添加成功！当前购物车商品数: ${cart.length}`);
}

// 更新购物车显示函数（增强版）
function updateCartDisplay() {
    console.log('🔄 更新购物车显示...');
    
    const orderItemsContainer = document.getElementById('order-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');
    
    // 悬浮订单元素
    const floatingOrderItemsContainer = document.getElementById('floating-order-items');
    const floatingTotalPriceElement = document.getElementById('floating-total-price');
    const floatingCheckoutButton = document.getElementById('floating-checkout-btn');
    const cartBadgeElement = document.getElementById('cart-badge');
    
    // 检查必要的DOM元素
    if (!orderItemsContainer) {
        console.warn('⚠️ order-items 容器不存在');
        return;
    }
    
    // 清空容器
    orderItemsContainer.innerHTML = '';
    if (floatingOrderItemsContainer) floatingOrderItemsContainer.innerHTML = '';
    
    console.log(`📊 购物车当前商品数: ${cart.length}`);
    
    if (cart.length === 0) {
        // 如果购物车为空
        orderItemsContainer.innerHTML = '<p class="text-muted">您的购物车是空的</p>';
        if (floatingOrderItemsContainer) floatingOrderItemsContainer.innerHTML = '<p class="text-muted">您的购物车是空的</p>';
        if (totalPriceElement) totalPriceElement.textContent = '€0.00';
        if (floatingTotalPriceElement) floatingTotalPriceElement.textContent = '€0.00';
        if (checkoutButton) checkoutButton.disabled = true;
        if (floatingCheckoutButton) floatingCheckoutButton.disabled = true;
        if (cartBadgeElement) cartBadgeElement.textContent = '0';
        console.log('💭 购物车为空，显示空状态');
        return;
    }
    
    // 计算总价和商品总数
    let totalPrice = 0;
    let totalItems = 0;
    
    // 遍历购物车项并创建元素
    cart.forEach((item, index) => {
        try {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            totalPrice += itemTotal;
            totalItems += item.quantity || 1;
            
            console.log(`🛒 处理购物车项 ${index + 1}: ${item.name} x${item.quantity} = €${itemTotal.toFixed(2)}`);
            
            // 为主订单创建元素
            const orderItemElement = document.createElement('div');
            orderItemElement.className = 'order-item';
            orderItemElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${item.name || '未知商品'}</span>
                    <span class="price">€${(item.price || 0).toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="quantity-control">
                        <button class="btn btn-sm btn-outline-secondary decrease-quantity" data-id="${item.id}">-</button>
                        <span class="mx-2">${item.quantity || 1}</span>
                        <button class="btn btn-sm btn-outline-secondary increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">删除</button>
                </div>
            `;
            orderItemsContainer.appendChild(orderItemElement);
            
            // 为悬浮订单创建元素
            if (floatingOrderItemsContainer) {
                const floatingOrderItemElement = document.createElement('div');
                floatingOrderItemElement.className = 'order-item';
                floatingOrderItemElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span>${item.name || '未知商品'}</span>
                        <span class="price">€${(item.price || 0).toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="quantity-control">
                            <button class="btn btn-sm btn-outline-secondary floating-decrease-quantity" data-id="${item.id}">-</button>
                            <span class="mx-2">${item.quantity || 1}</span>
                            <button class="btn btn-sm btn-outline-secondary floating-increase-quantity" data-id="${item.id}">+</button>
                        </div>
                        <button class="btn btn-sm btn-outline-danger floating-remove-item" data-id="${item.id}">删除</button>
                    </div>
                `;
                floatingOrderItemsContainer.appendChild(floatingOrderItemElement);
            }
        } catch (error) {
            console.error(`❌ 处理购物车项失败 (索引 ${index}):`, error, item);
        }
    });
    
    console.log(`💰 总价计算: €${totalPrice.toFixed(2)}, 总商品数: ${totalItems}`);
    
    // 更新总价显示 - 简化版，先不考虑折扣
    if (totalPriceElement) totalPriceElement.textContent = `€${totalPrice.toFixed(2)}`;
    if (floatingTotalPriceElement) floatingTotalPriceElement.textContent = `€${totalPrice.toFixed(2)}`;
    
    // 如果有折扣系统，再获取折扣
    if (firebaseData && firebaseData.discounts) {
        firebaseData.discounts.getApplicableDiscount(totalPrice, function(discountRate) {
            const discountedPrice = totalPrice * discountRate;
            
            if (discountRate < 1) {
                const discountPercentage = (1 - discountRate) * 100;
                if (totalPriceElement) {
                    totalPriceElement.innerHTML = `€${totalPrice.toFixed(2)} <span class="text-success">→ €${discountedPrice.toFixed(2)} (-${discountPercentage.toFixed(0)}%)</span>`;
                }
                if (floatingTotalPriceElement) {
                    floatingTotalPriceElement.innerHTML = `€${totalPrice.toFixed(2)} <span class="text-success">→ €${discountedPrice.toFixed(2)}</span>`;
                }
            }
        });
    }
    
    // 更新购物车数量标记
    if (cartBadgeElement) cartBadgeElement.textContent = totalItems.toString();
    
    // 启用结账按钮
    if (checkoutButton) checkoutButton.disabled = false;
    if (floatingCheckoutButton) floatingCheckoutButton.disabled = false;
    
    // 绑定购物车控制按钮事件
    bindCartControlEvents();
    
    console.log('✅ 购物车显示更新完成');
}

// 绑定购物车控制事件
function bindCartControlEvents() {
    console.log('🔗 绑定购物车控制事件...');
    
    // 主订单数量控制按钮
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🔻 减少数量按钮被点击: ${itemId}`);
            decreaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🔺 增加数量按钮被点击: ${itemId}`);
            increaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🗑️ 删除商品按钮被点击: ${itemId}`);
            removeFromCart(itemId);
        });
    });
    
    // 悬浮订单数量控制按钮
    document.querySelectorAll('.floating-decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🔻 悬浮减少数量按钮被点击: ${itemId}`);
            decreaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.floating-increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🔺 悬浮增加数量按钮被点击: ${itemId}`);
            increaseQuantity(itemId);
        });
    });
    
    document.querySelectorAll('.floating-remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            console.log(`🗑️ 悬浮删除商品按钮被点击: ${itemId}`);
            removeFromCart(itemId);
        });
    });
    
    console.log('✅ 购物车控制事件绑定完成');
}

// 减少商品数量函数
function decreaseQuantity(itemId) {
    console.log(`🔻 减少商品数量: ${itemId}`);
    
    // 使用兼容的ID匹配逻辑
    let cartItem = cart.find(item => item.id.toString() === itemId.toString());
    
    if (cartItem) {
        cartItem.quantity -= 1;
        console.log(`📉 数量减少: ${cartItem.name} 现在数量=${cartItem.quantity}`);
        
        if (cartItem.quantity <= 0) {
            console.log('🗑️ 数量为0，删除商品');
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
        }
    } else {
        console.warn('⚠️ 未找到对应商品:', itemId);
    }
}

// 增加商品数量函数
function increaseQuantity(itemId) {
    console.log(`🔺 增加商品数量: ${itemId}`);
    
    // 使用兼容的ID匹配逻辑
    let cartItem = cart.find(item => item.id.toString() === itemId.toString());
    
    if (cartItem) {
        cartItem.quantity += 1;
        console.log(`📈 数量增加: ${cartItem.name} 现在数量=${cartItem.quantity}`);
        updateCartDisplay();
    } else {
        console.warn('⚠️ 未找到对应商品:', itemId);
    }
}

// 从购物车中移除商品函数
function removeFromCart(itemId) {
    console.log(`🗑️ 从购物车移除商品: ${itemId}`);
    console.log('🛒 删除前购物车:', cart);
    
    // 使用兼容的ID匹配逻辑进行过滤
    const originalLength = cart.length;
    cart = cart.filter(item => item.id.toString() !== itemId.toString());
    
    const removedCount = originalLength - cart.length;
    console.log(`🗑️ 删除了 ${removedCount} 个商品，剩余 ${cart.length} 个`);
    
    // 更新购物车显示
    updateCartDisplay();
    
    // 重置菜单项显示状态
    const addToCartButton = document.querySelector(`.add-to-cart[data-id="${itemId}"]`);
    if (addToCartButton) {
        addToCartButton.innerHTML = '添加到购物车';
        addToCartButton.classList.add('btn-primary');
        addToCartButton.classList.remove('btn-success');
        console.log('🔄 菜单按钮状态已重置');
    }
}

// 生成订单ID
function generateOrderId() {
    return new Promise((resolve) => {
        if (!firebaseData || !firebaseData.orders) {
            // 如果Firebase不可用，生成本地ID
            const today = new Date();
            const datePrefix = today.getFullYear().toString() +
                             (today.getMonth() + 1).toString().padStart(2, '0') +
                             today.getDate().toString().padStart(2, '0');
            const orderId = datePrefix + '-' + Date.now().toString().slice(-3);
            resolve(orderId);
            return;
        }
        
        firebaseData.orders.getAll(function(allOrders) {
            const today = new Date();
            const datePrefix = today.getFullYear().toString() +
                             (today.getMonth() + 1).toString().padStart(2, '0') +
                             today.getDate().toString().padStart(2, '0');
            
            let maxNumber = 0;
            allOrders.forEach(order => {
                if (order.id && order.id.startsWith(datePrefix)) {
                    const orderNumber = parseInt(order.id.slice(-3));
                    if (!isNaN(orderNumber) && orderNumber > maxNumber) {
                        maxNumber = orderNumber;
                    }
                }
            });
            
            const newNumber = (maxNumber + 1).toString().padStart(3, '0');
            const orderId = datePrefix + '-' + newNumber;
            resolve(orderId);
        });
    });
}

// 更新订单摘要函数
function updateOrderSummary() {
    console.log('📋 更新订单摘要...');
    
    const orderSummaryContainer = document.getElementById('order-summary-items');
    const orderSummaryTotal = document.getElementById('order-summary-total');
    
    if (!orderSummaryContainer) {
        console.warn('⚠️ order-summary-items 容器不存在');
        return;
    }
    
    // 清空容器
    orderSummaryContainer.innerHTML = '';
    
    if (cart.length === 0) {
        orderSummaryContainer.innerHTML = '<p class="text-muted">您的购物车是空的</p>';
        if (orderSummaryTotal) orderSummaryTotal.textContent = '€0.00';
        return;
    }
    
    // 计算商品总价
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);
        subtotal += itemTotal;
        
        const orderItemElement = document.createElement('div');
        orderItemElement.className = 'd-flex justify-content-between align-items-center mb-2';
        orderItemElement.innerHTML = `
            <div>
                <span class="fw-bold">${item.name || '未知商品'}</span> × ${item.quantity || 1}
            </div>
            <span>€${itemTotal.toFixed(2)}</span>
        `;
        orderSummaryContainer.appendChild(orderItemElement);
    });
    
    // 更新总价显示（简化版，暂不考虑折扣）
    if (orderSummaryTotal) orderSummaryTotal.textContent = `€${subtotal.toFixed(2)}`;
    
    // 如果有折扣系统，获取折扣
    if (firebaseData && firebaseData.discounts) {
        firebaseData.discounts.getApplicableDiscount(subtotal, function(discountRate) {
            const totalPrice = subtotal * discountRate;
            const discountAmount = subtotal - totalPrice;
            
            if (discountRate < 1) {
                const discountPercentage = (1 - discountRate) * 100;
                
                // 添加小计行
                const subtotalElement = document.createElement('div');
                subtotalElement.className = 'd-flex justify-content-between align-items-center mb-2';
                subtotalElement.innerHTML = `
                    <div><span>小计</span></div>
                    <span>€${subtotal.toFixed(2)}</span>
                `;
                orderSummaryContainer.appendChild(subtotalElement);
                
                // 添加折扣行
                const discountElement = document.createElement('div');
                discountElement.className = 'd-flex justify-content-between align-items-center mb-2 text-success';
                discountElement.innerHTML = `
                    <div><span>折扣 (${discountPercentage.toFixed(0)}%)</span></div>
                    <span>-€${discountAmount.toFixed(2)}</span>
                `;
                orderSummaryContainer.appendChild(discountElement);
                
                // 添加分隔线
                const dividerElement = document.createElement('hr');
                dividerElement.className = 'my-2';
                orderSummaryContainer.appendChild(dividerElement);
            }
            
            if (orderSummaryTotal) orderSummaryTotal.textContent = `€${totalPrice.toFixed(2)}`;
        });
    }
    
    console.log('✅ 订单摘要更新完成');
}

// 提交订单函数
async function submitOrder() {
    console.log('📤 提交订单...');
    
    // 获取表单数据
    const groupNickname = document.getElementById('group-nickname')?.value;
    const orderNote = document.getElementById('order-note')?.value;
    
    // 验证必填字段
    if (!groupNickname) {
        alert('请填写群昵称');
        return;
    }
    
    if (cart.length === 0) {
        alert('购物车为空，请先添加商品');
        return;
    }
    
    console.log('📝 订单信息:', { groupNickname, orderNote, cartItems: cart.length });
    
    // 计算商品小计
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    
    try {
        // 生成订单ID
        const orderId = await generateOrderId();
        console.log('🆔 生成订单ID:', orderId);
        
        // 创建订单对象
        const order = {
            id: orderId,
            customer: {
                name: groupNickname,
                phone: "",
                address: ""
            },
            items: [...cart],
            subtotal: subtotal,
            discountRate: 1, // 默认无折扣
            totalPrice: subtotal,
            note: orderNote || '',
            deliveryTime: "asap",
            status: 'new',
            createdAt: new Date().toISOString()
        };
        
        console.log('📦 创建订单对象:', order);
        
        // 保存订单
        if (firebaseData && firebaseData.orders) {
            firebaseData.orders.save(order, function(success, savedOrderId) {
                if (success) {
                    console.log('✅ 订单保存成功:', savedOrderId);
                    
                    // 显示订单成功模态框
                    document.getElementById('order-id').textContent = savedOrderId || order.id;
                    
                    // 关闭订单模态框
                    const orderModal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
                    if (orderModal) orderModal.hide();
                    
                    // 显示成功模态框
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    successModal.show();
                    
                    // 清空购物车
                    cart = [];
                    updateCartDisplay();
                    
                    // 重置表单
                    const orderForm = document.getElementById('order-form');
                    if (orderForm) orderForm.reset();
                    
                    // 重置所有菜单按钮状态
                    document.querySelectorAll('.add-to-cart').forEach(button => {
                        button.innerHTML = '添加到购物车';
                        button.classList.add('btn-primary');
                        button.classList.remove('btn-success');
                    });
                    
                    console.log('🎉 订单提交流程完成！');
                } else {
                    console.error('❌ 订单保存失败');
                    alert('订单提交失败，请重试');
                }
            });
        } else {
            console.error('❌ Firebase数据服务不可用');
            alert('订单提交失败，请检查网络连接后重试');
        }
    } catch (error) {
        console.error('❌ 提交订单失败:', error);
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

// 导出函数到全局作用域
window.loadMenu = loadMenu;
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;
window.decreaseQuantity = decreaseQuantity;
window.increaseQuantity = increaseQuantity;
window.removeFromCart = removeFromCart;
window.submitOrder = submitOrder;
window.updateOrderSummary = updateOrderSummary;

console.log('📝 app-fixed.js 加载完成'); 