const orderList = document.querySelector('.js-orderList');
let orderData = [];

//初始
function init(){
  getOrderList();
}
init();

//渲染圖表
function renderC3(){
  //資料蒐集
  let obj = {};
  orderData.forEach(function(item){
    item.products.forEach(function(productItem){
      if(obj[productItem.title] === undefined){
        obj[productItem.title] = productItem.quantity * productItem.price;
      }else{
        obj[productItem.title] += productItem.quantity * productItem.price;
      }
    })
  });

  //拉出關聯資料
  let originAry = Object.keys(obj);

  //組 C3 data.columns 資料關聯
  let rankSortAry = [];
  originAry.forEach(function(item){
    let ary = [];
    ary.push(item);
    ary.push(obj[item]);
    rankSortAry.push(ary);
  })

  //降冪排序
  rankSortAry.sort(function(a, b){
    return b[1] - a[1];
  })

  //超過4筆資料時才會觸發
  if(rankSortAry.length > 3){
    let otherTotal = 0;
    rankSortAry.forEach(function(item, index){
      if(index > 2){ //第4筆之後…
        otherTotal += rankSortAry[index][1]; //加總第4筆之後的價格
      }
    })
    rankSortAry.splice(3, rankSortAry.length - 1);//刪去第4筆之後資料
    rankSortAry.push(['其他', otherTotal]); //push第4筆並符合C3要的格式
  }

  //C3 圖表
  c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: rankSortAry,
    },
    color:{
      pattern: ['#301E5F','#5434A7', '#9D7FEA','#DACBFF']
    }
  });
}

//取得並渲染訂單資料
function getOrderList(){
  axios.get(`${baseUrl}/admin/${api_path}/orders`,{
    headers: {
      'Authorization': token,
    }
  })
  .then(function(res){
    orderData = res.data.orders;
    renderOrderList();
    renderC3();
  })
};

//渲染訂單資料
function renderOrderList(){
  let str = '';
  orderData.forEach(function(item){
    //組日期字串
    const timeStamp = new Date(item.createdAt * 1000) //改為13碼
    const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDay()}`;

    //組產品字串
    let productStr = '';
    item.products.forEach(function(productItem){
      productStr += `
        <p>${productItem.title} x ${productItem.quantity}</p>
      `
    })

    //判斷訂單狀態
    let orderStatus = item.paid ? '已處理' : '未處理';

    //組訂單字串
    str += `
    <tr>
      <td>${item.id}</td>
      <td>
        <p>${item.user.name}</p>
        <p>${item.user.tel}</p>
      </td>
      <td>${item.user.address}</td>
      <td>${item.user.email}</td>
      <td>
        <p>${productStr}</p>
      </td>
      <td>${orderTime}</td>
      <td class="orderStatus">
        <a class="js-orderStatus" data-status="${item.paid}" data-id='${item.id}' href="#">${orderStatus}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id='${item.id}' value="刪除" />
      </td>
    </tr>
    `
  })
  orderList.innerHTML = str;
}

//監聽訂單事件
orderList.addEventListener('click', function(e){
  e.preventDefault();
  const targetClass = e.target.getAttribute('class');
  let paidStatus = e.target.getAttribute('data-status');
  let orderId = e.target.getAttribute('data-id');

  //訂單狀態
  if(targetClass === 'js-orderStatus'){
    changeOrderStatus(paidStatus, orderId)
    return;
  }
  //刪除
  if(targetClass === 'delSingleOrder-Btn js-orderDelete'){
    deleteOrderItem(orderId)
    return;
  }
})

//修改訂單狀態
function changeOrderStatus(paidStatus, orderId){
  let newPaidStatus = paidStatus ? true : false;
  axios.put(`${baseUrl}/admin/${api_path}/orders`,{
    "data": {
      "id": orderId,
      "paid": newPaidStatus
    }
  },{
    headers: {
      'Authorization': token,
    }
  })
  .then(function(res){
    alert('修改訂單狀態成功！');
    getOrderList();
  })
}

//刪除特定訂單
function deleteOrderItem(orderId){
  axios.delete(`${baseUrl}/admin/${api_path}/orders/${orderId}`,{
    headers: {
      'Authorization': token,
    }
  })
  .then(function(res){
    alert('成功刪除該筆訂單！');
    getOrderList();
  })
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function(e){
  e.preventDefault()
  axios.delete(`${baseUrl}/admin/${api_path}/orders`,{
    headers: {
      'Authorization': token,
    }
  })
  .then(function(res){
    alert('全部訂單已刪除！');
    getOrderList();
  })
})