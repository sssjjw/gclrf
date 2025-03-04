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
    {
        id: 2,
        name: "招牌卤肉饭套餐",
        description: "招牌卤肉饭配卤蛋、小菜和例汤",
        price: 38.00,
        image: "https://images.unsplash.com/photo-1617622141573-2e00b8cbb916?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "套餐"
    },
    {
        id: 3,
        name: "香菇卤肉饭",
        description: "加入香菇提味的特色卤肉，口感更加丰富",
        price: 32.00,
        image: "https://images.unsplash.com/photo-1623341214825-9f4f963727da?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "主食"
    },
    {
        id: 4,
        name: "卤肉便当",
        description: "便携式卤肉饭，加配三样小菜",
        price: 35.00,
        image: "https://images.unsplash.com/photo-1619683548293-866c29175a4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "便当"
    },
    {
        id: 5,
        name: "素食卤肉饭",
        description: "使用素食材料制作的卤肉风味饭，适合素食者",
        price: 30.00,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "素食"
    },
    {
        id: 6,
        name: "卤肉饭家庭桶",
        description: "适合3-4人分享的家庭装卤肉饭",
        price: 88.00,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "家庭装"
    },
    {
        id: 7,
        name: "卤肉刈包",
        description: "台式刈包内夹卤肉，口感独特",
        price: 18.00,
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "小吃"
    },
    {
        id: 8,
        name: "卤肉饭儿童套餐",
        description: "小份卤肉饭配小菜和饮料，适合儿童",
        price: 28.00,
        image: "https://images.unsplash.com/photo-1576021182211-9ea8dced3690?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        category: "儿童套餐"
    }
];

// 导出菜单数据，供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { menuItems };
}