document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("#updateForm")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("#inv-btn")
      updateBtn.removeAttribute("disabled")
    })
});
