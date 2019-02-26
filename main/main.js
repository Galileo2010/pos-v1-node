module.exports = function printInventory(inputs) {
    let list = shoppingList(inputs);
    console.log(printinfo(list));
    return 'Hello World!';
};

const {loadAllItems, loadPromotions} = require('../main/datbase');
// [ids, nums, names, units, prices];
function printinfo(list)
{
    let sep = ['***<没钱赚商店>购物清单***\n','----------------------\n','**********************'];
    let info = sep[0];
    let totalSved = 0, totalCost = 0;
    let infoOfDiscount = '挥泪赠送商品：\n';
    let barcodes = loadPromotions()[0].barcodes;
    for(let i = 0, len = list[0].length; i < len; i++)
    {
        // 打折需要计算出折扣了多少钱
        let cost = list[1][i] * list[4][i], saved = 0;
        if(discounted(list[0][i], barcodes))
        {
            // 先要计算出节省了多少钱
            let free = getMaxFreeAmount(list[1][i]);
            saved = free * list[4][i];
            cost -= saved;
            // 后记录赠送信息到infoOfDiscount
            infoOfDiscount += '名称：' + list[2][i] + '，数量：' + free + list[3][i] +'\n';
        }
        info += '名称：'+ list[2][i] + '，数量：' + list[1][i] + list[3][i] +'，单价：'+ list[4][i].toFixed(2) +'(元)，小计：'+ cost.toFixed(2) + '(元)\n';
        totalSved += saved;
        totalCost += cost;
    }
    info += sep[1];
    if(totalSved === 0) infoOfDiscount = '';
    else infoOfDiscount += sep[1];
    info += infoOfDiscount;
    info += '总计：' + totalCost.toFixed(2) + '(元)\n' + '节省：' + totalSved.toFixed(2) + '(元)\n' + sep[2];
    return info;
}
// 获取详细清单
function shoppingList(inputs){
    let ids = [], nums = [], names =[], units = [], prices = [];
    let allItems = loadAllItems();
    for( let i of inputs){
        let [id, num] = (i.length === 10) ? [i, 1] : i.split("-");
        num = parseInt(num);
        index = ids.indexOf(id);
        if(index === -1)
        {
            let [name, uint, price] = getNameUnitPriceById(id, allItems);
            ids.push(id);
            nums.push(num);
            names.push(name);
            units.push(uint);
            prices.push(price);
        }
        else    
            nums[index] += num;
    }
    return [ids, nums, names, units, prices];
}
// 获取id对应的产品信息
function getNameUnitPriceById(id, allItems)
{
    for(item of allItems)
        if(item.barcode === id)
            return [item.name, item.unit, item.price];
    throw new Error("This id is not in DataBase.");
}
// 判断id对应的产品是否打折
function discounted(id, barcodes)
{
    for(barcode of barcodes)
        if(barcode === id)
            return true;// 打折
    return false;       // 不打折
}
// 根据打折商品的购买数量，买二送一的情况下计算最大的赠送的数量;
function getMaxFreeAmount(num)
{
    return num <= 2 ? 0 : Math.floor(num/3);
}
