
const suggestionsHeader = document.getElementById("nav"); 
const suggestionBtn = document.querySelectorAll(".suggestion-post-btn")
const overlay = document.querySelector(".overlay");
const popup = document.querySelector(".pop-up-window");

const closeBtn = document.querySelectorAll(".close-btn");
const popupTitle = document.getElementById("popup-title");
const popupBody = document.getElementById("popup-body");


window.addEventListener("scroll", function () {
  const scrollHeight = window.pageYOffset;

  if (scrollHeight > 30) {
    suggestionsHeader.classList.add("fixed-nav");  
  } else {
    suggestionsHeader.classList.remove("fixed-nav"); 
  }
});

suggestionBtn.forEach(btn => {
    btn.addEventListener('click', () => {
        const title = btn.getAttribute("data-title");
        const body = btn.getAttribute("data-body");

        popupTitle.textContent = title;
        popupBody.textContent = body;

        overlay.classList.add("show");
        popup.classList.add("show"); 


    })
})

closeBtn.forEach(element => {
    element.addEventListener('click', () => {
        overlay.classList.remove("show");
    })
})

