// ================== ELEMENT SELECTION ==================
const list = document.querySelectorAll("#list li");
const daftarList = document.querySelector(".daftar-list");
const listContainer = document.querySelector(".list-items");
const inputForm = document.querySelector(".text-input");
const taskInput = document.querySelector("#text");

// ================== HELPER FUNCTIONS ==================
async function fetchList() {
    try {
        const res = await fetch("/api/data");
        const data = await res.json();

        if (!data.list || data.list.length === 0) {
            listContainer.innerHTML = "<li>Daftar kosong</li>";
            return;
        }

        listContainer.innerHTML = data.list
            .map((item, index) => `
                <li class="task-item">
                    <span class="task-text">${item}</span>
                    <button class="btn btn-del" data-index="${index}">Hapus</button>
                    <button class="btn btn-edit" data-index="${index}">Edit</button>
                </li>`)
            .join("");

        setupDeleteButtons();
        setupEditButtons();
    } catch (err) {
        console.error("Gagal mengambil data:", err);
    }
}

function setupDeleteButtons() {
    const btnDelList = document.querySelectorAll(".btn-del");
    btnDelList.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const index = e.target.dataset.index;
            try {
                const res = await fetch(`/api/delete/${index}`, { method: "DELETE" });
                await res.json();
                e.target.closest("li").remove();
            } catch (err) {
                console.error("Gagal hapus:", err);
            }
        });
    });
}

function setupEditButtons() {
    const btnEdList = document.querySelectorAll(".btn-edit");
    btnEdList.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const li = e.target.closest("li");
            const oldText = li.querySelector(".task-text").textContent;

            const input = document.createElement("input");
            input.type = "text";
            input.value = oldText;
            input.classList.add("edit-input");

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "Simpan";
            saveBtn.classList.add("btn", "btn-save");

            li.innerHTML = "";
            li.append(input, saveBtn);

            saveBtn.addEventListener("click", async () => {
                const newValue = input.value.trim();
                if (!newValue) return;

                try {
                    const index = btn.dataset.index;
                    const res = await fetch(`/api/data/${index}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ task: newValue })
                    });
                    await res.json();

                    li.innerHTML = `
                        <span class="task-text">${newValue}</span>
                        <button class="btn btn-del" data-index="${index}">Hapus</button>
                        <button class="btn btn-edit" data-index="${index}">Edit</button>
                    `;
                    setupDeleteButtons();
                    setupEditButtons();
                } catch (err) {
                    console.error("Gagal update:", err);
                }
            });
        });
    });
}

// ================== EVENT LIST ITEM ==================
list.forEach((item, index) => {
    item.addEventListener("click", () => {
        switch (index) {
            case 0: // Tampilkan daftar list
                daftarList.classList.toggle("show");
                fetchList();
                break;

            case 1: // Form tambah task
                inputForm.classList.toggle("show");
                break;
        }
    });
});

// ================== FORM SUBMIT ==================
inputForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // hilangkan efek reload browser
    const newTask = taskInput.value.trim();
    if (!newTask) return;

    try {
        const res = await fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ list: newTask })
        });
        await res.json();
        taskInput.value = "";
        fetchList(); // refresh list otomatis
    } catch (err) {
        console.error("Gagal tambah data:", err);
    }
});
