
const productList = document.querySelector('.productWrap');
let productData = [];
let cartData = [];

// 初始
function init(){
  getProductList();
  getCartList();
}
init();

// 取得產品列表
function getProductList(){
  axios.get(`${baseUrl}/customer/${api_path}/products`)
  .then(function(res){
    productData = res.data.products;
    renderProductList();
  });
}

// 渲染產品列表
function renderProductList(){
  let str = '';
  productData.forEach(function(item){
    str += organizeProductHTMLItem(item);
  });
  productList.innerHTML = str;
}

// 組建產品列表 item
function organizeProductHTMLItem(item){
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${numberComma(item.origin_price)}</del>
    <p class="nowPrice">NT$${numberComma(item.price)}</p>
  </li>`;
}

const productSelect = document.querySelector('.productSelect');

// 篩選產品
productSelect.addEventListener('change', function(e){
  const category = e.target.value;
  if(category == '全部'){
    getProductList();
    return;
  }
  let str ='';
  productData.forEach(function(item){
    if(category == item.category){
      str += organizeProductHTMLItem(item);
    }
  })
  productList.innerHTML = str;
})

// 監聽 productList
productList.addEventListener('click', function(e){
  e.preventDefault();
  let addCartClass = e.target.getAttribute('class');
  if(addCartClass !== 'addCardBtn'){
    return;
  }
  let productId = e.target.getAttribute('data-id');
  let numCheck = 1;

  cartData.forEach(function(item){
    if(item.product.id === productId){
      numCheck = item.quantity += 1;
    }
  })

  axios.post(`${baseUrl}/customer/${api_path}/carts`,{
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  })
    .then(function(res){
      getCartList();
      alert('已加入購物車！');
    })
})


// 取得購物車產品列表
function getCartList(){
  axios.get(`${baseUrl}/customer/${api_path}/carts`)
    .then(function(res){
      cartData = res.data.carts;
      renderCartList();
      //購物車總金額
      document.querySelector('.js-total').textContent = numberComma(res.data.finalTotal);
    })
}

let shoppingCartTableBody = document.querySelector('.shoppingCart-tableBody');

function renderCartList(){

  let str = '';
  cartData.forEach(function(item){
    str += `
    <tr>
      <td>
      <div class="cardItem-title">
          <img src="${item.product.images}" alt="">
          <p>${item.product.title}</p>
      </div>
      </td>
      <td>NT$${numberComma(item.product.price)}</td>
      <td>${item.quantity}</td>
      <td>NT$${numberComma(item.product.price * item.quantity)}</td>
      <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
              clear
          </a>
      </td>
    </tr>
    `
  });
  shoppingCartTableBody.innerHTML = str;
}

shoppingCartTableBody.addEventListener('click', function(e){
  e.preventDefault();
  let cartId = e.target.getAttribute('data-id');
  if(cartId === null){
    return;
  }
  axios.delete(`${baseUrl}/customer/${api_path}/carts/${cartId}`)
    .then(function(res){
      alert('已刪除單筆訂單！');
      getCartList();
    })
})

const discardAllBtn = document.querySelector('.discardAllBtn');

discardAllBtn.addEventListener('click', function(e){
  e.preventDefault();
  axios.delete(`${baseUrl}/customer/${api_path}/carts`)
    .then(function(res){
      getCartList();
      alert('已刪除全部訂單！');
    })
    .catch(function(res){
      alert('購物車已清空，請勿重複點擊！');
    })
})


//資料驗證
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "Email": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};

inputs.forEach((item) => {
  item.addEventListener("change", function () {

    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
        return;
      })
    }
  });
});

//送出訂單資料
const orderInfoBtn = document.querySelector('.orderInfo-btn');

orderInfoBtn.addEventListener('click', function(e){
  e.preventDefault();
  if(cartData.length === 0){
    alert('您的購物車是空的，請添加商品至購物車！')
  }
  const customerName = document.querySelector('#customerName').value;
  const customerPhone = document.querySelector('#customerPhone').value;
  const customerEmail = document.querySelector('#customerEmail').value;
  const customerAddress = document.querySelector('#customerAddress').value;
  const customerTradeWay = document.querySelector('#tradeWay').value;

  if(customerName == '' || customerPhone == '' || customerEmail == '' || customerAddress == '' || customerTradeWay == ''){
    alert('請填寫正確資訊！');
    return;
  };

  axios.post(`${baseUrl}/customer/${api_path}/orders`,{
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  }).then(function(res){
      alert('成功建立訂單！');
      form.reset();//清空表格資料
      getCartList();
    })
})


//優化介面，千分符號
function numberComma(num){
  let comma=/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g
  return num.toString().replace(comma, ',')
}