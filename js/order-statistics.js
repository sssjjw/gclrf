// 订单统计功能

// 初始化变量
let categoryStats = {};
let allOrders = [];

// 加载订单统计数据
function loadOrderStatistics() {
    console.log('📊 开始加载订单统计数据...');
    
    if (!firebaseData || !firebaseData.orders) {
        console.error('❌ firebaseData.orders 不可用');
        displayErrorMessage('Firebase数据服务不可用，无法加载统计数据');
        return;
    }
    
    // 获取所有订单
    firebaseData.orders.getAll(function(ordersList) {
        try {
            allOrders = ordersList || [];
            console.log(`📋 获取到 ${allOrders.length} 个订单`);
            
            // 计算各品类数量
            calculateCategoryStats();
            // 显示统计结果
            displayCategoryStats();
        } catch (error) {
            console.error('❌ 处理订单统计数据失败:', error);
            displayErrorMessage('处理统计数据时出现错误');
        }
    });
}

// 计算各品类的数量统计
function calculateCategoryStats() {
    console.log('🧮 开始计算品类统计...');
    
    // 重置统计数据
    categoryStats = {};
    
    // 筛选出需要统计的订单（新订单和处理中的订单）
    const activeOrders = allOrders.filter(order => 
        order.status === 'new' || order.status === 'processing'
    );
    
    console.log(`📊 需要统计的活跃订单数: ${activeOrders.length}`);
    
    // 遍历所有活跃订单
    activeOrders.forEach((order, orderIndex) => {
        try {
            if (!order.items || !Array.isArray(order.items)) {
                console.warn(`⚠️ 订单 ${order.id} 没有有效的items数据`);
                return;
            }
            
            // 遍历订单中的每个菜品
            order.items.forEach((item, itemIndex) => {
                try {
                    // 获取分类，如果没有则使用默认分类
                    const category = item.category || '未分类';
                    const itemName = item.name || '未知商品';
                    const quantity = parseInt(item.quantity) || 1;
                    
                    console.log(`🍽️ 处理菜品: ${itemName} (分类: ${category}, 数量: ${quantity})`);
                    
                    // 如果该分类不存在，则初始化
                    if (!categoryStats[category]) {
                        categoryStats[category] = {
                            totalQuantity: 0,
                            items: {}
                        };
                        console.log(`➕ 创建新分类: ${category}`);
                    }
                    
                    // 增加该分类的总数量
                    categoryStats[category].totalQuantity += quantity;
                    
                    // 如果该菜品不存在，则初始化
                    if (!categoryStats[category].items[itemName]) {
                        categoryStats[category].items[itemName] = 0;
                    }
                    
                    // 增加该菜品的数量
                    categoryStats[category].items[itemName] += quantity;
                    
                } catch (itemError) {
                    console.error(`❌ 处理菜品失败 (订单${orderIndex}, 菜品${itemIndex}):`, itemError, item);
                }
            });
        } catch (orderError) {
            console.error(`❌ 处理订单失败 (索引${orderIndex}):`, orderError, order);
        }
    });
    
    console.log('✅ 品类统计计算完成:', categoryStats);
}

// 显示统计结果
function displayCategoryStats() {
    console.log('🎨 开始显示统计结果...');
    
    const statsContainer = document.getElementById('category-stats-container');
    
    if (!statsContainer) {
        console.error('❌ category-stats-container 元素不存在');
        return;
    }
    
    // 清空容器
    statsContainer.innerHTML = '';
    
    // 如果没有统计数据
    if (!categoryStats || Object.keys(categoryStats).length === 0) {
        statsContainer.innerHTML = '<p class="text-muted text-center py-5">暂无需要制作的菜品</p>';
        console.log('💭 没有需要统计的数据');
        return;
    }
    
    // 按分类总数量排序
    const sortedCategories = Object.keys(categoryStats).sort((a, b) => 
        categoryStats[b].totalQuantity - categoryStats[a].totalQuantity
    );
    
    console.log(`📊 将显示 ${sortedCategories.length} 个分类的统计`);
    
    // 遍历每个分类
    sortedCategories.forEach((category, index) => {
        try {
            console.log(`🏷️ 创建分类卡片 ${index + 1}: ${category} (${categoryStats[category].totalQuantity}份)`);
            
            // 创建分类卡片
            const categoryCard = document.createElement('div');
            categoryCard.className = 'card mb-4';
            
            // 创建卡片头部
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header d-flex justify-content-between align-items-center';
            cardHeader.innerHTML = `
                <h5 class="mb-0">${category}</h5>
                <span class="badge bg-primary">${categoryStats[category].totalQuantity} 份</span>
            `;
            
            // 创建卡片内容
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            // 创建表格
            const table = document.createElement('table');
            table.className = 'table table-hover';
            
            // 创建表头
            const tableHead = document.createElement('thead');
            tableHead.innerHTML = `
                <tr>
                    <th>菜品名称</th>
                    <th>数量</th>
                </tr>
            `;
            
            // 创建表格内容
            const tableBody = document.createElement('tbody');
            
            // 按菜品数量排序
            const sortedItems = Object.keys(categoryStats[category].items).sort((a, b) => 
                categoryStats[category].items[b] - categoryStats[category].items[a]
            );
            
            // 遍历该分类下的所有菜品
            sortedItems.forEach(itemName => {
                const quantity = categoryStats[category].items[itemName];
                
                // 创建行
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${itemName}</td>
                    <td><span class="badge bg-secondary">${quantity} 份</span></td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // 组装表格
            table.appendChild(tableHead);
            table.appendChild(tableBody);
            
            // 将表格添加到卡片内容
            cardBody.appendChild(table);
            
            // 组装卡片
            categoryCard.appendChild(cardHeader);
            categoryCard.appendChild(cardBody);
            
            // 将卡片添加到容器
            statsContainer.appendChild(categoryCard);
            
        } catch (cardError) {
            console.error(`❌ 创建分类卡片失败 (${category}):`, cardError);
        }
    });
    
    console.log('✅ 统计结果显示完成');
}

// 显示错误消息
function displayErrorMessage(message) {
    const statsContainer = document.getElementById('category-stats-container');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
    }
}

// 筛选订单状态
function filterOrderStatsByStatus() {
    console.log('🔍 筛选订单状态...');
    
    const filterElement = document.getElementById('order-stats-filter');
    if (!filterElement) {
        console.warn('⚠️ order-stats-filter 元素不存在');
        return;
    }
    
    const filterValue = filterElement.value;
    console.log(`📊 筛选条件: ${filterValue}`);
    
    try {
        // 重置统计数据
        categoryStats = {};
        
        // 根据筛选条件处理订单
        let ordersToProcess = [];
        
        if (filterValue === 'all') {
            ordersToProcess = allOrders;
        } else if (filterValue === 'active') {
            ordersToProcess = allOrders.filter(order => 
                order.status === 'new' || order.status === 'processing'
            );
        } else {
            ordersToProcess = allOrders.filter(order => order.status === filterValue);
        }
        
        console.log(`📋 筛选后的订单数: ${ordersToProcess.length}`);
        
        // 遍历筛选后的订单
        ordersToProcess.forEach((order, orderIndex) => {
            try {
                if (!order.items || !Array.isArray(order.items)) {
                    return;
                }
                
                // 遍历订单中的每个菜品
                order.items.forEach((item, itemIndex) => {
                    try {
                        const category = item.category || '未分类';
                        const itemName = item.name || '未知商品';
                        const quantity = parseInt(item.quantity) || 1;
                        
                        // 如果该分类不存在，则初始化
                        if (!categoryStats[category]) {
                            categoryStats[category] = {
                                totalQuantity: 0,
                                items: {}
                            };
                        }
                        
                        // 增加该分类的总数量
                        categoryStats[category].totalQuantity += quantity;
                        
                        // 如果该菜品不存在，则初始化
                        if (!categoryStats[category].items[itemName]) {
                            categoryStats[category].items[itemName] = 0;
                        }
                        
                        // 增加该菜品的数量
                        categoryStats[category].items[itemName] += quantity;
                        
                    } catch (itemError) {
                        console.error(`❌ 筛选时处理菜品失败:`, itemError);
                    }
                });
            } catch (orderError) {
                console.error(`❌ 筛选时处理订单失败:`, orderError);
            }
        });
        
        // 显示统计结果
        displayCategoryStats();
        
    } catch (error) {
        console.error('❌ 筛选订单状态失败:', error);
        displayErrorMessage('筛选数据时出现错误');
    }
}

// 导出函数
window.loadOrderStatistics = loadOrderStatistics;
window.filterOrderStatsByStatus = filterOrderStatsByStatus;