document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const leftHeader = document.getElementById("header-software");
    const rightHeader = document.getElementById("header-game");

    let currentSide = null;

    document.addEventListener("mousemove", (e) => {
        const midpoint = window.innerWidth / 2;

        if (e.clientX < midpoint && currentSide !== "left") {
            currentSide = "left";
            leftHeader.classList.add("active");
            rightHeader.classList.remove("active");
            body.style.backgroundColor = "#e0f7fa"; // light blue
        } else if (e.clientX >= midpoint && currentSide !== "right") {
            currentSide = "right";
            rightHeader.classList.add("active");
            leftHeader.classList.remove("active");
            body.style.backgroundColor = "#ffe0b2"; // light orange
        }
    });

    // Click navigation
    document.addEventListener("click", (e) => {
        const midpoint = window.innerWidth / 2;
        if (e.clientX < midpoint) {
            window.location.href = "/software";
        } else {
            window.location.href = "/game";
        }
    });

    // Optional: reset background if mouse leaves window
    document.addEventListener("mouseleave", () => {
        currentSide = null;
        leftHeader.classList.remove("active");
        rightHeader.classList.remove("active");
        body.style.backgroundColor = "#f5f5f5";
    });
});
