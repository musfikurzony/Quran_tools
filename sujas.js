// sujas.js
// ---------------------------------------------------------
// Handles grammar notes popup + position adjustment + closing
// ---------------------------------------------------------

export function initGrammarPopups() {
    document.body.addEventListener("click", function (e) {
        const wordBtn = e.target.closest(".word-btn");
        const box = document.querySelector(".grammar-box");

        // If clicking a word button → show grammar popup
        if (wordBtn) {
            const grammar = wordBtn.dataset.grammar || "No grammar notes found";

            box.innerHTML = grammar;
            box.style.display = "block";

            // Popup position logic (prevents going outside screen)
            const rect = wordBtn.getBoundingClientRect();
            const boxHeight = box.offsetHeight;

            let topPos = rect.bottom + window.scrollY + 8;

            // If popup goes beyond bottom → open upward
            if (topPos + boxHeight > window.innerHeight + window.scrollY) {
                topPos = rect.top + window.scrollY - boxHeight - 8;
            }

            box.style.left = rect.left + "px";
            box.style.top = topPos + "px";
            return;
        }

        // If click outside → hide popup
        if (!e.target.closest(".grammar-box")) {
            box.style.display = "none";
        }
    });
}
