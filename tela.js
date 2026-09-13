const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");
const btn = document.getElementById("toggle-btn");

btn.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
    } else {
        sidebar.classList.toggle("closed");
        content.classList.toggle("expand");
    }
});