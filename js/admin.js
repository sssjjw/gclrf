// 初始化变量
let orders = [];
let menuItemsList = [];
let discountRulesList = [];

// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载订单数据
    loadOrders();
    
    // 绑定筛选器事件
    document.getElementById('order-filter').addEventListener('change', filterOrders);
    
    // 加载菜单数据
    loadMenuItems();
    
    // 加载菜单说明文字
    loadMenuDescription();
    
    // 加载折扣规则
    loadDiscountRules();
    
    // 绑定保存菜单说明文字按钮事件
    document.getElementById('save-menu-description').addEventListener('click', saveMenuDescription);
    
    // 绑定添加菜单项按钮事件
    document.getElementById('add-menu-item').addEventListener('click', showAddMenuItemModal);
    
    // 绑定保存菜单项按钮事件
    document.getElementById('save-menu-item').addEventListener('click', saveMenuItem);
    
    // 绑定添加折扣规则按钮事件
    document.getElementById('add-discount-rule').addEventListener('click', showAddDiscountRuleModal);
    
    // 绑定保存折扣规则按钮事件
    document.getElementById('save-discount-rule').addEventListener('click', saveDiscountRule);
    
    // 绑定数据迁移按钮事件
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
});

// 加载折扣规则
function loadDiscountRules() {
    firebaseData.discounts.getRules(function(rules) {
        discountRulesList = rules;
        displayDiscountRules();
    });
}

// 显示折扣规则列表
function displayDiscountRules() {
    const discountRulesTable = document.getElementById('discount-rules-table');
    
    // 清空表格
    discountRulesTable.innerHTML = '';
    
    if (discountRulesList.length === 0) {
        discountRulesTable.innerHTML = '<tr><td colspan="4" class="text-center text-muted">暂无折扣规则</td></tr>';
        return;
    }
    
    // 按金额阈值升序排序
    discountRulesList.sort((a, b) => a.threshold - b.threshold);
    
    // 遍历折扣规则并创建表格行
    discountRulesList.forEach(rule => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>€${rule.threshold.toFixed(2)}</td>
            <td>${rule.rate}%</td>
            <td>
                <span class="badge ${rule.enabled !== false ? 'bg-success' : 'bg-secondary'}">
                    ${rule.enabled !== false ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-discount-rule" data-id="${rule.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-discount-rule" data-id="${rule.id}">删除</button>
            </td>
        `;
        
        discountRulesTable.appendChild(row);
    });
    
    // 绑定编辑按钮事件
    document.querySelectorAll('.edit-discount-rule').forEach(button => {
        button.addEventListener('click', function() {
            const ruleId = this.getAttribute('data-id');
            editDiscountRule(ruleId);
        });
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-discount-rule').forEach(button => {
        button.addEventListener('click', function() {
            const ruleId = this.getAttribute('data-id');
            deleteDiscountRule(ruleId);
        });
    });
}

// 显示添加折扣规则模态框
function showAddDiscountRuleModal() {
    // 清空表单
    document.getElementById('discount-rule-form').reset();
    document.getElementById('discount-rule-id').value = '';
    
    // 设置模态框标题
    document.getElementById('discountRuleModalLabel').textContent = '添加折扣规则';
    
    // 显示模态框
    const discountRuleModal = new bootstrap.Modal(document.getElementById('discountRuleModal'));
    discountRuleModal.show();
}

// 编辑折扣规则
function editDiscountRule(ruleId) {
    // 查找折扣规则
    const rule = discountRulesList.find(rule => rule.id === ruleId);
    
    if (!rule) return;
    
    // 填充表单
    document.getElementById('discount-rule-id').value = rule.id;
    document.getElementById('discount-threshold').value = rule.threshold;
    document.getElementById('discount-rate').value = rule.rate;
    document.getElementById('discount-enabled').checked = rule.enabled !== false;
    
    // 设置模态框标题
    document.getElementById('discountRuleModalLabel').textContent = '编辑折扣规则';
    
    // 显示模态框
    const discountRuleModal = new bootstrap.Modal(document.getElementById('discountRuleModal'));
    discountRuleModal.show();
}

// 保存折扣规则
function saveDiscountRule() {
    // 获取表单数据
    const ruleId = document.getElementById('discount-rule-id').value;
    const threshold = parseFloat(document.getElementById('discount-threshold').value);
    const rate = parseInt(document.getElementById('discount-rate').value);
    const enabled = document.getElementById('discount-enabled').checked;
    
    // 验证数据
    if (isNaN(threshold) || threshold < 0) {
        alert('请输入有效的金额阈值');
        return;
    }
    
    if (isNaN(rate) || rate < 1 || rate > 100) {
        alert('请输入有效的折扣率（1-100）');
        return;
    }
    
    // 创建或更新折扣规则对象
    const rule = {
        id: ruleId || Date.now().toString(),
        threshold: threshold,
        rate: rate,
        enabled: enabled
    };
    
    // 保存到Firebase
    firebaseData.discounts.saveRule(rule, function(success) {
        if (success) {
            // 关闭模态框
            const discountRuleModal = bootstrap.Modal.getInstance(document.getElementById('discountRuleModal'));
            discountRuleModal.hide();
            
            // 重新加载折扣规则列表
            loadDiscountRules();
        } else {
            alert('保存折扣规则失败，请重试');
        }
    });
}

// 删除折扣规则
function deleteDiscountRule(ruleId) {
    if (confirm('确定要删除这条折扣规则吗？')) {
        firebaseData.discounts.deleteRule(ruleId, function(success) {
            if (success) {
                // 重新加载折扣规则列表
                loadDiscountRules();
            } else {
                alert('删除折扣规则失败，请重试');
            }
        });
    }
}

// 从Firebase加载订单
function loadOrders(filter = 'all') {
    firebaseData.orders.getAll(function(ordersList) {
        orders = ordersList;
        // 按创建时间倒序排列，最新的订单显示在前面
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 根据筛选条件过滤订单
        if (filter !== 'all') {
            const filteredOrders = orders.filter(order => order.status === filter);
            displayOrders(filteredOrders);
        } else {
            displayOrders(orders);
        }
    });
}

// 显示订单列表
function displayOrders(ordersToDisplay) {
    const ordersContainer = document.getElementById('orders-container');
    
    // 清空容器
    ordersContainer.innerHTML = '';
    
    if (ordersToDisplay.length === 0) {
        ordersContainer.innerHTML = '<p class="text-muted text-center py-5">暂无订单数据</p>';
        return;
    }
    
    // 遍历订单并创建卡片
    ordersToDisplay.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = `card order-card mb-3 ${order.status}`;
        
        // 格式化日期
        const orderDate = new Date(order.createdAt);
        const formattedDate = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}-${orderDate.getDate().toString().padStart(2, '0')} ${orderDate.getHours().toString().padStart(2, '0')}:${orderDate.getMinutes().toString().padStart(2, '0')}`;
        
        // 格式化配送时间
        let deliveryTimeText = '';
        switch(order.deliveryTime) {
            case 'asap':
                deliveryTimeText = '尽快配送';
                break;
            case 'lunch':
                deliveryTimeText = '午餐时段 (11:30-13:30)';
                break;
            case 'dinner':
                deliveryTimeText = '晚餐时段 (17:30-19:30)';
                break;
            default:
                deliveryTimeText = order.deliveryTime;
        }
        
        // 格式化订单状态
        let statusText = '';
        let statusBadgeClass = '';
        switch(order.status) {
            case 'new':
                statusText = '新订单';
                statusBadgeClass = 'bg-success';
                break;
            case 'processing':
                statusText = '处理中';
                statusBadgeClass = 'bg-warning text-dark';
                break;
            case 'completed':
                statusText = '已完成';
                statusBadgeClass = 'bg-secondary';
                break;
            case 'cancelled':
                statusText = '已取消';
                statusBadgeClass = 'bg-danger';
                break;
            default:
                statusText = order.status;
                statusBadgeClass = 'bg-primary';
        }
        
        // 构建订单项HTML
        let orderItemsHtml = '';
        order.items.forEach(item => {
            orderItemsHtml += `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <span class="fw-bold">${item.name}</span> × ${item.quantity}
                    </div>
                    <span>€${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });
        
        // 构建订单卡片HTML
        orderCard.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <div>
                    <span class="badge ${statusBadgeClass} me-2">${statusText}</span>
                    <span class="fw-bold">订单号: ${order.id}</span>
                </div>
                <small class="text-muted">${formattedDate}</small>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h5 class="card-title">客户信息</h5>
                        <p class="mb-1"><strong>群昵称:</strong> ${order.customer.name}</p>
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
                            <span class="price">€${order.totalPrice.toFixed(2)}</span>
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
        
        ordersContainer.appendChild(orderCard);
    });
}

// 筛选订单
function filterOrders() {
    const filterValue = document.getElementById('order-filter').value;
    
    if (filterValue === 'all') {
        displayOrders(orders);
    } else {
        const filteredOrders = orders.filter(order => order.status === filterValue);
        displayOrders(filteredOrders);
    }
}

// 更新订单状态
function updateOrderStatus(orderId, newStatus) {
    // 使用Firebase更新订单状态
    firebaseData.orders.updateStatus(orderId, newStatus, function(success) {
        if (success) {
            // 查找本地订单并更新状态（用于UI更新）
            const orderIndex = orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                orders[orderIndex].status = newStatus;
            }
            
            // 重新显示订单
            filterOrders();
        } else {
            alert('更新订单状态失败，请重试');
        }
    });
}


// 加载菜单数据
function loadMenuItems() {
    // 从Firebase获取菜单数据
    firebaseData.menu.getItems(function(items) {
        menuItemsList = items;
        // 显示菜单列表
        displayMenuItems();
    });
}

// 显示菜单列表
function displayMenuItems() {
    const menuItemsTable = document.getElementById('menu-items-table');
    
    // 清空表格
    menuItemsTable.innerHTML = '';
    
    // 遍历菜单项并创建表格行
    menuItemsList.forEach(item => {
        const row = document.createElement('tr');
        
        // 设置可见性按钮的文本和类
        const visibilityBtnText = item.visible !== false ? '隐藏' : '显示';
        const visibilityBtnClass = item.visible !== false ? 'btn-outline-secondary' : 'btn-outline-success';
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td><img src="${item.image}" alt="${item.name}" width="50" height="50" class="rounded"></td>
            <td>${item.name}</td>
            <td>${item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}</td>
            <td>€${item.price.toFixed(2)}</td>
            <td>${item.category}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-menu-item" data-id="${item.id}">编辑</button>
                <button class="btn btn-sm btn-outline-danger delete-menu-item" data-id="${item.id}">删除</button>
                <button class="btn btn-sm ${visibilityBtnClass} toggle-visibility" data-id="${item.id}">${visibilityBtnText}</button>
            </td>
        `;
        
        menuItemsTable.appendChild(row);
    });
    
    // 绑定编辑按钮事件
    document.querySelectorAll('.edit-menu-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            editMenuItem(itemId);
        });
    });
    
    // 绑定删除按钮事件
    document.querySelectorAll('.delete-menu-item').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            deleteMenuItem(itemId);
        });
    });
    
    // 绑定显示/隐藏切换按钮事件
    document.querySelectorAll('.toggle-visibility').forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-id'));
            toggleMenuItemVisibility(itemId);
        });
    });
}

// 显示添加菜单项模态框
function showAddMenuItemModal() {
    // 清空表单
    document.getElementById('menu-item-form').reset();
    document.getElementById('menu-item-id').value = '';
    
    // 设置模态框标题
    document.getElementById('menuItemModalLabel').textContent = '添加菜单项';
    
    // 显示模态框
    const menuItemModal = new bootstrap.Modal(document.getElementById('menuItemModal'));
    menuItemModal.show();
}

// 编辑菜单项
function editMenuItem(itemId) {
    // 查找菜单项
    const menuItem = menuItemsList.find(item => item.id === itemId);
    
    if (!menuItem) return;
    
    // 填充表单
    document.getElementById('menu-item-id').value = menuItem.id;
    document.getElementById('menu-item-name').value = menuItem.name;
    document.getElementById('menu-item-description').value = menuItem.description;
    document.getElementById('menu-item-price').value = menuItem.price;
    document.getElementById('menu-item-image').value = menuItem.image;
    document.getElementById('menu-item-category').value = menuItem.category;
    
    // 设置模态框标题
    document.getElementById('menuItemModalLabel').textContent = '编辑菜单项';
    
    // 显示模态框
    const menuItemModal = new bootstrap.Modal(document.getElementById('menuItemModal'));
    menuItemModal.show();
}

// 保存菜单项
function saveMenuItem() {
    // 获取表单数据
    const itemId = document.getElementById('menu-item-id').value;
    const name = document.getElementById('menu-item-name').value;
    const description = document.getElementById('menu-item-description').value;
    const price = parseFloat(document.getElementById('menu-item-price').value);
    const image = document.getElementById('menu-item-image').value;
    const category = document.getElementById('menu-item-category').value;
    
    // 验证必填字段
    if (!name || !description || isNaN(price) || !image || !category) {
        alert('请填写所有必填字段');
        return;
    }
    
    let menuItem;
    
    if (itemId) {
        // 编辑现有菜单项
        const index = menuItemsList.findIndex(item => item.id === parseInt(itemId));
        
        if (index !== -1) {
            menuItem = {
                ...menuItemsList[index],
                name,
                description,
                price,
                image,
                category
            };
        }
    } else {
        // 添加新菜单项
        const newId = generateMenuItemId();
        
        menuItem = {
            id: newId,
            name,
            description,
            price,
            image,
            category,
            visible: true // 默认新菜单项为可见
        };
    }
    
    // 保存到Firebase
    firebaseData.menu.saveItem(menuItem, function(success) {
        if (success) {
            // 重新加载菜单列表
            loadMenuItems();
            
            // 关闭模态框
            const menuItemModal = bootstrap.Modal.getInstance(document.getElementById('menuItemModal'));
            menuItemModal.hide();
        } else {
            alert('保存菜单项失败，请重试');
        }
    });
}

// 删除菜单项
function deleteMenuItem(itemId) {
    // 确保itemId是整数
    itemId = parseInt(itemId);
    
    // 确认删除
    if (!confirm('确定要删除这个菜单项吗？')) {
        return;
    }
    
    // 从Firebase删除菜单项
    firebaseData.menu.deleteItem(itemId, function(success) {
        if (success) {
            // 重新加载菜单列表
            loadMenuItems();
        } else {
            alert('删除菜单项失败，请重试');
        }
    });
}

// 生成菜单项ID
function generateMenuItemId() {
    // 找出最大的ID
    let maxId = 0;
    menuItemsList.forEach(item => {
        if (item.id > maxId) {
            maxId = item.id;
        }
    });
    
    // 返回新ID
    return maxId + 1;
}

// 切换菜单项的显示/隐藏状态
function toggleMenuItemVisibility(itemId) {
    // 查找菜单项
    const index = menuItemsList.findIndex(item => item.id === itemId);
    
    if (index === -1) return;
    
    // 切换可见性状态
    const menuItem = menuItemsList[index];
    menuItem.visible = menuItem.visible === false ? true : false;
    
    // 保存到Firebase
    firebaseData.menu.saveItem(menuItem, function(success) {
        if (success) {
            // 重新加载菜单列表
            loadMenuItems();
        } else {
            alert('更新菜单项显示状态失败，请重试');
        }
    });
}

// 保存菜单数据到localStorage
function saveMenuItemsToLocalStorage() {
    localStorage.setItem('menuItems', JSON.stringify(menuItemsList));
}

// 加载菜单说明文字
function loadMenuDescription() {
    firebaseData.menu.getDescription(function(description) {
        document.getElementById('menu-description-text').value = description || '欢迎光临哥村卤肉饭，我们提供正宗台式卤肉饭，选用上等食材，每日新鲜制作。';
    });
}

// 保存菜单说明文字
function saveMenuDescription() {
    const menuDescription = document.getElementById('menu-description-text').value;
    firebaseData.menu.saveDescription(menuDescription, function(success) {
        if (success) {
            alert('菜单说明文字已保存');
        } else {
            alert('菜单说明文字保存失败，请重试');
        }
    });
}