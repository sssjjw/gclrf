// 订单统计功能

// 初始化变量
let categoryStats = {};
let allOrders = [];

// 加载订单统计数据
function loadOrderStatistics() {
    // 获取所有订单
    firebaseData.orders.getAll(function(ordersList) {
        allOrders = ordersList;
        // 计算各品类数量
        calculateCategoryStats();
        // 显示统计结果
        displayCategoryStats();
    });
}

// 计算各品类的数量统计
function calculateCategoryStats() {
    // 重置统计数据
    categoryStats = {};
    
    // 筛选出需要统计的订单（新订单和处理中的订单）
    const activeOrders = allOrders.filter(order => 
        order.status === 'new' || order.status === 'processing'
    );
    
    // 遍历所有活跃订单
    activeOrders.forEach(order => {
        // 遍历订单中的每个菜品
        order.items.forEach(item => {
            // 如果该分类不存在，则初始化
            if (!categoryStats[item.category]) {
                categoryStats[item.category] = {
                    totalQuantity: 0,
                    items: {}
                };
            }
            
            // 增加该分类的总数量
            categoryStats[item.category].totalQuantity += item.quantity;
            
            // 如果该菜品不存在，则初始化
            if (!categoryStats[item.category].items[item.name]) {
                categoryStats[item.category].items[item.name] = 0;
            }
            
            // 增加该菜品的数量
            categoryStats[item.category].items[item.name] += item.quantity;
        });
    });
}

// 显示统计结果
function displayCategoryStats() {
    const statsContainer = document.getElementById('category-stats-container');
    
    // 清空容器
    statsContainer.innerHTML = '';
    
    // 如果没有统计数据
    if (Object.keys(categoryStats).length === 0) {
        statsContainer.innerHTML = '<p class="text-muted text-center py-5">暂无需要制作的菜品</p>';
        return;
    }
    
    // 遍历每个分类
    for (const category in categoryStats) {
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
        
        // 遍历该分类下的所有菜品
        for (const itemName in categoryStats[category].items) {
            const quantity = categoryStats[category].items[itemName];
            
            // 创建行
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${itemName}</td>
                <td>${quantity} 份</td>
            `;
            
            tableBody.appendChild(row);
        }
        
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
    }
}

// 筛选订单状态
function filterOrderStatsByStatus() {
    const filterValue = document.getElementById('order-stats-filter').value;
    
    // 重新计算统计数据
    if (filterValue === 'all') {
        // 所有订单
        allOrders.forEach(order => {
            calculateCategoryStats();
        });
    } else {
        // 根据状态筛选订单
        const filteredOrders = allOrders.filter(order => order.status === filterValue);
        // 重置统计数据
        categoryStats = {};
        
        // 遍历筛选后的订单
        filteredOrders.forEach(order => {
            // 遍历订单中的每个菜品
            order.items.forEach(item => {
                // 如果该分类不存在，则初始化
                if (!categoryStats[item.category]) {
                    categoryStats[item.category] = {
                        totalQuantity: 0,
                        items: {}
                    };
                }
                
                // 增加该分类的总数量
                categoryStats[item.category].totalQuantity += item.quantity;
                
                // 如果该菜品不存在，则初始化
                if (!categoryStats[item.category].items[item.name]) {
                    categoryStats[item.category].items[item.name] = 0;
                }
                
                // 增加该菜品的数量
                categoryStats[item.category].items[item.name] += item.quantity;
            });
        });
    }
    
    // 显示统计结果
    displayCategoryStats();
}

// 导出函数
window.loadOrderStatistics = loadOrderStatistics;
window.filterOrderStatsByStatus = filterOrderStatsByStatus;