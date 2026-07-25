const actionButton = document.querySelector("#action-button");
const statusText = document.querySelector("#status");

actionButton.addEventListener("click", () => {
  statusText.textContent = "HTML、CSS 和 JavaScript 均已正常加载。";
  actionButton.textContent = "运行正常";
  actionButton.disabled = true;
});
