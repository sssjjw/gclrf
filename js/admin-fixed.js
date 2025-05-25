// 增强版后台管理系统 - 修复版本
let orders = [];
let menuItemsList = [];
let discountRulesList = [];
let retryCount = 0;
const maxRetries = 5;

// 等待Firebase初始化完成
function waitForFirebase(callback, attempts = 0) {
    if (attempts > 10) {
        console.error('❌ Firebase初始化超时');
        alert('Firebase连接失败，请刷新页面重试');
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

// 安全的事件绑定函数
function safeBindEvent(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(event, handler);
        console.log(`✅ 已绑定事件: ${elementId}.${event}`);
    } else {
        console.warn(`⚠️ 元素不存在: ${elementId}`);
    }
}

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM加载完成，等待Firebase初始化...');
    
    waitForFirebase(function() {
        console.log('🔧 开始初始化后台管理系统...');
        
        // 检查用户认证状态
        checkAuthAndInitialize();
        
        // 绑定所有事件
        bindAllEvents();
    });
});

// 检查认证状态并初始化
function checkAuthAndInitialize() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('✅ 用户已认证:', user.uid);
            initializeSystem();
        } else {
            console.log('⏳ 用户未认证，尝试匿名登录...');
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
                        alert('登录失败，请刷新页面重试');
                    }
                });
        }
    });
}

// 初始化系统
function initializeSystem() {
    console.log('🔄 开始加载数据...');
    
    try {
        // 加载订单数据
        loadOrders();
        
        // 加载菜单数据
        loadMenuItems();
        
        // 加载菜单说明文字
        loadMenuDescription();
        
        // 加载折扣规则
        loadDiscountRules();
        
        console.log('✅ 系统初始化完成');
    } catch (error) {
        console.error('❌ 系统初始化失败:', error);
    }
}

// 绑定所有事件
function bindAllEvents() {
    console.log('🔗 开始绑定事件...');
    
    // 订单筛选器
    safeBindEvent('order-filter', 'change', filterOrders);
    
    // 菜单管理
    safeBindEvent('save-menu-description', 'click', saveMenuDescription);
    safeBindEvent('add-menu-item', 'click', showAddMenuItemModal);
    safeBindEvent('save-menu-item', 'click', saveMenuItem);
    
    // 折扣规则管理
    safeBindEvent('add-discount-rule', 'click', showAddDiscountRuleModal);
    safeBindEvent('save-discount-rule', 'click', saveDiscountRule);
    
    // 数据迁移
    safeBindEvent('migrate-data', 'click', function() {
        if (confirm('确定要将本地数据迁移到Firebase吗？这将覆盖Firebase中的现有数据。')) {
            firebaseData.migrate.fromLocalStorage(function(success) {
                if (success) {
                    alert('数据迁移成功！');
                    initializeSystem(); // 重新加载数据
                } else {
                    alert('数据迁移失败，请查看控制台错误信息。');
                }
            });
        }
    });
    
    console.log('✅ 事件绑定完成');
}

// 加载订单（增强版）
function loadOrders(filter = 'all') {
    console.log('📥 开始加载订单...');
    
    if (!firebaseData || !firebaseData.orders) {
        console.error('❌ firebaseData.orders 不可用');
        return;
    }
    
    firebaseData.orders.getAll(function(ordersList) {
        try {
            if (!ordersList || !Array.isArray(ordersList)) {
                console.warn('⚠️ 订单数据为空或格式错误');
                ordersList = [];
            }
            
            orders = ordersList;
            console.log(`✅ 加载了 ${orders.length} 个订单`);
            
            // 按创建时间倒序排列
            orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            
            // 根据筛选条件显示订单
            if (filter !== 'all') {
                const filteredOrders = orders.filter(order => order.status === filter);
                displayOrders(filteredOrders);
            } else {
                displayOrders(orders);
            }
        } catch (error) {
            console.error('❌ 处理订单数据失败:', error);
            displayOrders([]);
        }
    });
}

// 显示订单列表（增强版）
function displayOrders(ordersToDisplay) {
    const ordersContainer = document.getElementById('orders-container');
    
    if (!ordersContainer) {
        console.warn('⚠️ orders-container 元素不存在');
        return;
    }
    
    // 清空容器
    ordersContainer.innerHTML = '';
    
    if (!ordersToDisplay || ordersToDisplay.length === 0) {
        ordersContainer.innerHTML = '<div class="alert alert-info text-center"><i class="bi bi-info-circle"></i> 暂无订单数据</div>';
        return;
    }
    
    console.log(`📋 显示 ${ordersToDisplay.length} 个订单`);
    
    // 遍历订单并创建卡片
    ordersToDisplay.forEach((order, index) => {
        try {
            const orderCard = createOrderCard(order);
            ordersContainer.appendChild(orderCard);
        } catch (error) {
            console.error(`❌ 创建订单卡片失败 (索引 ${index}):`, error, order);
        }
    });
}

// 创建订单卡片
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = `card order-card mb-3 ${order.status || 'unknown'}`;
    
    // 安全的日期格式化
    let formattedDate = '未知时间';
    try {
        if (order.createdAt) {
            const orderDate = new Date(order.createdAt);
            formattedDate = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')} ${orderDate.getHours().toString().padStart(2, '0')}:${orderDate.getMinutes().toString().padStart(2, '0')}`;
        }
    } catch (error) {
        console.warn('⚠️ 日期格式化失败:', error);
    }
    
    // 格式化配送时间
    let deliveryTimeText = '未指定';
    switch(order.deliveryTime) {
        case 'asap': deliveryTimeText = '尽快配送'; break;
        case 'lunch': deliveryTimeText = '午餐时段 (11:30-13:30)'; break;
        case 'dinner': deliveryTimeText = '晚餐时段 (17:30-19:30)'; break;
        default: deliveryTimeText = order.deliveryTime || '未指定';
    }
    
    // 格式化订单状态
    let statusText = '未知';
    let statusBadgeClass = 'bg-secondary';
    switch(order.status) {
        case 'new': statusText = '新订单'; statusBadgeClass = 'bg-success'; break;
        case 'processing': statusText = '处理中'; statusBadgeClass = 'bg-warning text-dark'; break;
        case 'completed': statusText = '已完成'; statusBadgeClass = 'bg-secondary'; break;
        case 'cancelled': statusText = '已取消'; statusBadgeClass = 'bg-danger'; break;
        default: statusText = order.status || '未知'; statusBadgeClass = 'bg-primary';
    }
    
    // 构建订单项HTML
    let orderItemsHtml = '';
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
            try {
                const itemTotal = (item.price || 0) * (item.quantity || 1);
                orderItemsHtml += `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            <span class="fw-bold">${item.name || '未知商品'}</span> × ${item.quantity || 1}
                        </div>
                        <span>€${itemTotal.toFixed(2)}</span>
                    </div>
                `;
            } catch (error) {
                console.warn('⚠️ 处理订单项失败:', error, item);
            }
        });
    } else {
        orderItemsHtml = '<div class="text-muted">订单项数据错误</div>';
    }
    
    // 构建订单卡片HTML
    orderCard.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <span class="badge ${statusBadgeClass} me-2">${statusText}</span>
                <span class="fw-bold">订单号: ${order.id || '未知'}</span>
            </div>
            <small class="text-muted">${formattedDate}</small>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <h5 class="card-title">客户信息</h5>
                    <p class="mb-1"><strong>群昵称:</strong> ${(order.customer && order.customer.name) || '未提供'}</p>
                    <p class="mb-1"><strong>配送时间:</strong> ${deliveryTimeText}</p>
                    ${order.note ? `<p class="mb-1"><strong>备注:</strong> ${order.note}</p>` : ''}
                </div>
                <div class="col-md-6">
                    <h5 class="card-title">订单详情</h5>
                    <div class="order-items mb-3">
                        ${orderItemsHtml}
                    </div>
                    <div class="d-flex justify-content-between align-items-center fw-bold">
                        <span>总计:</span>
                        <span class="price">€${(order.totalPrice || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-footer">
            <div class="d-flex justify-content-end">
                ${order.status === 'new' ? `
                    <button class="btn btn-sm btn-warning me-2" onclick="updateOrderStatus('${order.id}', 'processing')">开始处理</button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">取消订单</button>
                ` : ''}
                ${order.status === 'processing' ? `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}', 'completed')">标记为已完成</button>
                ` : ''}
            </div>
        </div>
    `;
    
    return orderCard;
}

// 筛选订单
function filterOrders() {
    const filterElement = document.getElementById('order-filter');
    if (!filterElement) {
        console.warn('⚠️ order-filter 元素不存在');
        return;
    }
    
    const filterValue = filterElement.value;
    console.log('🔍 筛选订单:', filterValue);
    
    if (filterValue === 'all') {
        displayOrders(orders);
    } else {
        const filteredOrders = orders.filter(order => order.status === filterValue);
        displayOrders(filteredOrders);
    }
}

// 更新订单状态
function updateOrderStatus(orderId, newStatus) {
    console.log(`🔄 更新订单状态: ${orderId} -> ${newStatus}`);
    
    if (!firebaseData || !firebaseData.orders) {
        console.error('❌ firebaseData.orders 不可用');
        alert('系统错误，无法更新订单状态');
        return;
    }
    
    firebaseData.orders.updateStatus(orderId, newStatus, function(success) {
        if (success) {
            console.log('✅ 订单状态更新成功');
            
            // 更新本地数据
            const orderIndex = orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
            }
            
            // 重新显示订单
            filterOrders();
        } else {
            console.error('❌ 订单状态更新失败');
            alert('更新订单状态失败，请重试');
        }
    });
}

// 加载菜单数据（增强版）
function loadMenuItems() {
    console.log('📥 开始加载菜单...');
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        return;
    }
    
    firebaseData.menu.getItems(function(items) {
        try {
            if (!items || !Array.isArray(items)) {
                console.warn('⚠️ 菜单数据为空或格式错误');
                items = [];
            }
            
            menuItemsList = items;
            console.log(`✅ 加载了 ${menuItemsList.length} 个菜单项`);
            
            displayMenuItems();
        } catch (error) {
            console.error('❌ 处理菜单数据失败:', error);
            displayMenuItems();
        }
    });
}

// 显示菜单列表（增强版）
function displayMenuItems() {
    const menuItemsTable = document.getElementById('menu-items-table');
    
    if (!menuItemsTable) {
        console.warn('⚠️ menu-items-table 元素不存在');
        return;
    }
    
    // 清空表格
    menuItemsTable.innerHTML = '';
    
    if (!menuItemsList || menuItemsList.length === 0) {
        menuItemsTable.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无菜单数据</td></tr>';
        return;
    }
    
    console.log(`📋 显示 ${menuItemsList.length} 个菜单项`);
    
    // 遍历菜单项并创建表格行
    menuItemsList.forEach((item, index) => {
        try {
            const row = createMenuItemRow(item);
            menuItemsTable.appendChild(row);
        } catch (error) {
            console.error(`❌ 创建菜单项行失败 (索引 ${index}):`, error, item);
        }
    });
    
    // 绑定编辑和删除按钮事件
    bindMenuItemEvents();
}

// 创建菜单项表格行
function createMenuItemRow(item) {
    const row = document.createElement('tr');
    
    // 安全的图片URL处理
    const imageUrl = item.image || item.imageUrl || 'https://via.placeholder.com/50x50?text=No+Image';
    
    // 设置可见性按钮
    const visibilityBtnText = item.visible !== false ? '隐藏' : '显示';
    const visibilityBtnClass = item.visible !== false ? 'btn-outline-secondary' : 'btn-outline-success';
    
    row.innerHTML = `
        <td>${item.id || '未知'}</td>
        <td><img src="${imageUrl}" alt="${item.name || '未知'}" width="50" height="50" class="rounded" onerror="this.src='https://via.placeholder.com/50x50?text=Error'"></td>
        <td>${item.name || '未知名称'}</td>
        <td>${(item.description || '无描述').length > 30 ? (item.description || '无描述').substring(0, 30) + '...' : (item.description || '无描述')}</td>
        <td>€${(item.price || 0).toFixed(2)}</td>
        <td>${item.category || '未分类'}</td>
        <td>
            <button class="btn btn-sm btn-outline-primary edit-menu-item me-1" data-id="${item.id}">编辑</button>
            <button class="btn btn-sm ${visibilityBtnClass} toggle-visibility me-1" data-id="${item.id}">${visibilityBtnText}</button>
            <button class="btn btn-sm btn-outline-danger delete-menu-item" data-id="${item.id}">删除</button>
        </td>
    `;
    
    return row;
}

// 绑定菜单项事件
function bindMenuItemEvents() {
    // 编辑按钮
    document.querySelectorAll('.edit-menu-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            editMenuItem(itemId);
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-menu-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            deleteMenuItem(itemId);
        });
    });
    
    // 显示/隐藏按钮
    document.querySelectorAll('.toggle-visibility').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = this.getAttribute('data-id');
            toggleMenuItemVisibility(itemId);
        });
    });
}

// 其他函数保持原有逻辑，但增加错误处理...

// 加载菜单说明（增强版）
function loadMenuDescription() {
    console.log('📥 加载菜单说明...');
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        return;
    }
    
    firebaseData.menu.getDescription(function(description) {
        const textarea = document.getElementById('menu-description-text');
        if (textarea) {
            textarea.value = description || '';
            console.log('✅ 菜单说明加载完成');
        } else {
            console.warn('⚠️ menu-description-text 元素不存在');
        }
    });
}

// 保存菜单说明
function saveMenuDescription() {
    console.log('💾 保存菜单说明...');
    
    const textarea = document.getElementById('menu-description-text');
    if (!textarea) {
        console.warn('⚠️ menu-description-text 元素不存在');
        return;
    }
    
    const description = textarea.value;
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        alert('系统错误，无法保存菜单说明');
        return;
    }
    
    firebaseData.menu.saveDescription(description, function(success) {
        if (success) {
            console.log('✅ 菜单说明保存成功');
            alert('菜单说明保存成功！');
        } else {
            console.error('❌ 菜单说明保存失败');
            alert('保存失败，请重试');
        }
    });
}

// 为了兼容性，保留其他必要的函数
function loadDiscountRules() {
    console.log('📥 加载折扣规则...');
    if (firebaseData && firebaseData.discounts) {
        firebaseData.discounts.getRules(function(rules) {
            discountRulesList = rules || [];
            console.log(`✅ 加载了 ${discountRulesList.length} 个折扣规则`);
            if (typeof displayDiscountRules === 'function') {
                displayDiscountRules();
            }
        });
    }
}

// 显示添加菜单项模态框
function showAddMenuItemModal() {
    console.log('➕ 显示添加菜单项模态框');
    const form = document.getElementById('menu-item-form');
    const modal = document.getElementById('menuItemModal');
    
    if (form) {
        form.reset();
        const idField = document.getElementById('menu-item-id');
        if (idField) idField.value = '';
    }
    
    const titleElement = document.getElementById('menuItemModalLabel');
    if (titleElement) {
        titleElement.textContent = '添加菜单项';
    }
    
    if (modal && typeof bootstrap !== 'undefined') {
        const menuItemModal = new bootstrap.Modal(modal);
        menuItemModal.show();
    }
}

// 编辑菜单项
function editMenuItem(itemId) {
    console.log('✏️ 编辑菜单项:', itemId);
    
    const item = menuItemsList.find(item => item.id == itemId);
    if (!item) {
        console.error('❌ 找不到菜单项:', itemId);
        alert('找不到指定的菜单项');
        return;
    }
    
    // 填充表单
    const fields = {
        'menu-item-id': item.id,
        'menu-item-name': item.name,
        'menu-item-description': item.description,
        'menu-item-price': item.price,
        'menu-item-image': item.image || item.imageUrl,
        'menu-item-category': item.category
    };
    
    for (const [fieldId, value] of Object.entries(fields)) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value || '';
        }
    }
    
    const titleElement = document.getElementById('menuItemModalLabel');
    if (titleElement) {
        titleElement.textContent = '编辑菜单项';
    }
    
    const modal = document.getElementById('menuItemModal');
    if (modal && typeof bootstrap !== 'undefined') {
        const menuItemModal = new bootstrap.Modal(modal);
        menuItemModal.show();
    }
}

// 保存菜单项
function saveMenuItem() {
    console.log('💾 保存菜单项...');
    
    // 获取表单数据
    const itemData = {
        id: document.getElementById('menu-item-id')?.value,
        name: document.getElementById('menu-item-name')?.value,
        description: document.getElementById('menu-item-description')?.value,
        price: parseFloat(document.getElementById('menu-item-price')?.value || 0),
        image: document.getElementById('menu-item-image')?.value,
        category: document.getElementById('menu-item-category')?.value
    };
    
    // 验证数据
    if (!itemData.name || !itemData.description || !itemData.image) {
        alert('请填写所有必填字段');
        return;
    }
    
    if (isNaN(itemData.price) || itemData.price < 0) {
        alert('请输入有效的价格');
        return;
    }
    
    // 如果没有ID，生成新ID
    if (!itemData.id) {
        itemData.id = Date.now().toString();
    }
    
    // 设置默认可见性
    itemData.visible = true;
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        alert('系统错误，无法保存菜单项');
        return;
    }
    
    firebaseData.menu.saveItem(itemData, function(success) {
        if (success) {
            console.log('✅ 菜单项保存成功');
            
            // 关闭模态框
            const modal = document.getElementById('menuItemModal');
            if (modal && typeof bootstrap !== 'undefined') {
                const menuItemModal = bootstrap.Modal.getInstance(modal);
                if (menuItemModal) menuItemModal.hide();
            }
            
            // 重新加载菜单项列表
            loadMenuItems();
        } else {
            console.error('❌ 菜单项保存失败');
            alert('保存失败，请重试');
        }
    });
}

// 删除菜单项
function deleteMenuItem(itemId) {
    if (!confirm('确定要删除这个菜单项吗？')) {
        return;
    }
    
    console.log('🗑️ 删除菜单项:', itemId);
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        alert('系统错误，无法删除菜单项');
        return;
    }
    
    firebaseData.menu.deleteItem(itemId, function(success) {
        if (success) {
            console.log('✅ 菜单项删除成功');
            loadMenuItems();
        } else {
            console.error('❌ 菜单项删除失败');
            alert('删除失败，请重试');
        }
    });
}

// 切换菜单项可见性
function toggleMenuItemVisibility(itemId) {
    console.log('👁️ 切换菜单项可见性:', itemId);
    
    const item = menuItemsList.find(item => item.id == itemId);
    if (!item) {
        console.error('❌ 找不到菜单项:', itemId);
        return;
    }
    
    // 切换可见性
    item.visible = item.visible === false;
    
    if (!firebaseData || !firebaseData.menu) {
        console.error('❌ firebaseData.menu 不可用');
        alert('系统错误，无法更新菜单项');
        return;
    }
    
    firebaseData.menu.saveItem(item, function(success) {
        if (success) {
            console.log('✅ 菜单项可见性更新成功');
            loadMenuItems();
        } else {
            console.error('❌ 菜单项可见性更新失败');
            alert('更新失败，请重试');
        }
    });
}

// 折扣规则相关函数（简化版）
function showAddDiscountRuleModal() {
    console.log('➕ 显示添加折扣规则模态框');
    // 简化实现
}

function saveDiscountRule() {
    console.log('💾 保存折扣规则');
    // 简化实现
}

// 导出主要函数到全局作用域（用于HTML中的onclick和诊断工具检测）
window.updateOrderStatus = updateOrderStatus;
window.editMenuItem = editMenuItem;
window.deleteMenuItem = deleteMenuItem;
window.toggleMenuItemVisibility = toggleMenuItemVisibility;
window.showAddMenuItemModal = showAddMenuItemModal;
window.saveMenuItem = saveMenuItem;
window.saveMenuDescription = saveMenuDescription;
window.showAddDiscountRuleModal = showAddDiscountRuleModal;
window.saveDiscountRule = saveDiscountRule;

// 导出诊断工具需要检测的函数
window.loadOrders = loadOrders;
window.loadMenuItems = loadMenuItems;
window.loadMenuDescription = loadMenuDescription;
window.loadDiscountRules = loadDiscountRules;
window.filterOrders = filterOrders;
window.displayOrders = displayOrders;
window.displayMenuItems = displayMenuItems;

console.log('📝 admin-fixed.js 加载完成'); 