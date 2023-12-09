//admin
// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener('click', closeMenu);
})

function menuToggle() {
  if(menu.classList.contains('openMenu')) {
      menu.classList.remove('openMenu');
  }else {
      menu.classList.add('openMenu');
  }
}
function closeMenu() {
  menu.classList.remove('openMenu');
}

// C3.js
// let chart = c3.generate({
//   bindto: '#chart', // HTML 元素綁定
//   data: {
//     type: "pie",
//     columns: [
//       ['Louvre 雙人床架', 1],
//       ['Antony 雙人床架', 2],
//       ['Anty 雙人床架', 3],
//       ['其他', 4],
//     ],
//     colors:{
//         "Louvre 雙人床架":"#DACBFF",
//         "Antony 雙人床架":"#9D7FEA",
//         "Anty 雙人床架": "#5434A7",
//         "其他": "#301E5F",
//     }
//   },
// });