// 测试订单数据脚本

// 创建一些测试订单数据
function createTestOrders() {
    // 检查是否已有订单数据
    const existingOrders = localStorage.getItem('orders');
    if (existingOrders && JSON.parse(existingOrders).length > 0) {
        console.log('已存在订单数据，不创建测试数据');
        return;
    }
    
    // 创建测试订单
    const testOrders = [
        {
            id: '20230501001',
            customer: {
                name: '测试用户1',
                phone: '',
                address: ''
            },
            items: [
                {
                    id: 1,
                    name: '卤肉饭',
                    price: 25,
                    quantity: 2
                },
                {
                    id: 3,
                    name: '卤蛋',
                    price: 5,
                    quantity: 3
                }
            ],
            totalPrice: 65,
            note: '不要葱',
            deliveryTime: 'asap',
            status: 'new',
            createdAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
        },
        {
            id: '20230501002',
            customer: {
                name: '测试用户2',
                phone: '',
                address: ''
            },
            items: [
                {
                    id: 2,
                    name: '鸡腿饭',
                    price: 28,
                    quantity: 1
                },
                {
                    id: 4,
                    name: '卤肉',
                    price: 15,
                    quantity: 1
                }
            ],
            totalPrice: 43,
            note: '',
            deliveryTime: 'lunch',
            status: 'processing',
            createdAt: new Date(Date.now() - 7200000).toISOString() // 2小时前
        },
        {
            id: '20230501003',
            customer: {
                name: '测试用户3',
                phone: '',
                address: ''
            },
            items: [
                {
                    id: 1,
                    name: '卤肉饭',
                    price: 25,
                    quantity: 3
                }
            ],
            totalPrice: 75,
            note: '多加饭',
            deliveryTime: 'dinner',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
        }
    ];
    
    // 保存到localStorage
    localStorage.setItem('orders', JSON.stringify(testOrders));
    console.log('已创建测试订单数据');
    
    // 刷新页面以显示测试数据
    location.reload();
}

// 添加按钮到页面
function addTestButton() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'mt-3 text-center';
    buttonDiv.innerHTML = `
        <button id="create-test-orders" class="btn btn-outline-secondary btn-sm">
            创建测试订单数据
        </button>
    `;
    
    // 插入到容器的开头
    container.insertBefore(buttonDiv, container.firstChild);
    
    // 绑定点击事件
    document.getElementById('create-test-orders').addEventListener('click', createTestOrders);
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    addTestButton();
});