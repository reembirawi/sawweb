const closeBtn = document.querySelector('.close-btn');
const openBbtn = document.querySelector('.sidebar-toggle');
const links = document.querySelector('.sidebar');

openBbtn.addEventListener('click', () => {
        links.classList.add('show-sidebar');
});

closeBtn.addEventListener('click', () => {
        links.classList.remove('show-sidebar');
}); 

const userHeader = document.getElementById("nav"); 

window.addEventListener("scroll", function () {
  const scrollHeight = window.pageYOffset;

  if (scrollHeight > 50) {
    userHeader.classList.add("fixed-nav");  
  } else {
    userHeader.classList.remove("fixed-nav"); 
  }
});

