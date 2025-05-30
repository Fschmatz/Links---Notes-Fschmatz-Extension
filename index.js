const noteInput = document.getElementById("note-input");
const saveNoteBtn = document.getElementById("saveNote-btn");
const saveTabBtn = document.getElementById("saveTab-btn");
const notesList = document.getElementById("notes-list");
const tabsList = document.getElementById("tabs-list");
const tabButtons = document.querySelectorAll(".tab-button");
const exportBtn = document.getElementById("export-btn");

let notes = null;
let tabs = null;

document.addEventListener("DOMContentLoaded", () => {
    notes = JSON.parse(localStorage.getItem("notes")) || [];
    tabs = JSON.parse(localStorage.getItem("tabs")) || [];
    renderNotes();
    renderTabs();
});

// Tab switching
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const targetTab = button.dataset.tab;
        
        // Update button states
        tabButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        
        // Update content visibility
        document.querySelectorAll(".tab-content").forEach(content => {
            content.classList.remove("active");
        });
        document.getElementById(`${targetTab}-content`).classList.add("active");
    });
});

// Save note
function saveNote() {
    const noteText = noteInput.value.trim();
    if (noteText) {
        notes.unshift(noteText);
        localStorage.setItem("notes", JSON.stringify(notes));
        noteInput.value = "";
        renderNotes();
    }
}

// Save current tab
saveTabBtn.addEventListener("click", () => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const tabInfo = {
            url: currentTab.url,
            title: currentTab.title
        };
        saveTab(tabInfo);
    });
});

function saveTab(tabInfo) {
    tabs.unshift(tabInfo);
    localStorage.setItem("tabs", JSON.stringify(tabs));
    renderTabs();
}

// Export
function exportData() {
   
    const exportData = {
        notes: notes,
        tabs: tabs
    };    
   
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "links_notes_fschmatz_extension_backup.json";
    document.body.appendChild(a);
    a.click();
  
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

// Render functions
function renderTabs() {
    tabsList.innerHTML = tabs.map((tab, index) => `
        <li>
            <div class="list-item">
                <a class="item-content-tabs" href="${tab.url}" target="_blank">
                    ${tab.title}
                </a>
                <button class="delete-btn" data-type="tab" data-index="${index}">
                   <img src="assets/trash-fill.svg" alt="delete" width="14" height="14">
                </button>
            </div>
        </li>
    `).join("");
}

function renderNotes() {
    notesList.innerHTML = notes.map((note, index) => `
        <li>
            <div class="list-item">
                <span class="item-content-notes">${note}</span>
                <button class="delete-btn" data-type="note" data-index="${index}">
                     <img src="assets/trash-fill.svg" alt="delete" width="14" height="14">
                </button>
            </div>
        </li>
    `).join("");
}

// Event listeners
saveNoteBtn.addEventListener("click", saveNote);

noteInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        saveNote();
    }
});

exportBtn.addEventListener("click", exportData);

// Delete items
document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-btn")) {
        const button = e.target.closest(".delete-btn");
        const type = button.dataset.type;
        const index = parseInt(button.dataset.index);
        
        if (type === "note") {
            notes.splice(index, 1);
            localStorage.setItem("notes", JSON.stringify(notes));
            renderNotes();
        } else if (type === "tab") {
            tabs.splice(index, 1);
            localStorage.setItem("tabs", JSON.stringify(tabs));
            renderTabs();
        }
    }
});
