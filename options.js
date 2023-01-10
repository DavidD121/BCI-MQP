document.getElementById("other").addEventListener("click", () => {
    if(document.getElementById("other").checked) {
        document.getElementById("other_txt").style.display = "block"
    } else {
        document.getElementById("other_txt").style.display = "none"
    }
});