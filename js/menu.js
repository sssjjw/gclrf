// 菜单数据
const menuItems = [
    {
        id: 1,
        name: "经典卤肉饭",
        description: "传统台式卤肉，搭配新鲜蔬菜和卤蛋",
        price: 28.00,
        image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "主食"
    },
];

// 导出菜单数据，供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { menuItems };
}