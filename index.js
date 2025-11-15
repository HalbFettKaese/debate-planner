const participants = {};
const boxes = [];
let dragged = null;
var nameInput;
var placeholder;
var selectedLanguage = null;
var updateMembers;
function initialize() {
    makePlaceholder();

    ["dropbox1", "dropbox2", "dropbox3", "dropbox4", "dropbox5"]
    .forEach((id, idx) => loadDropbox(id, idx));

    nameInput = document.getElementById("nameInput");

    nameInput.addEventListener("change", (t, e) => addParticipant());

    loadTrash();

    loadLanguageIcon();

    selectedLanguage = localStorage.getItem("language") || "en";

    selectLanguage(selectedLanguage);

    const memberList = JSON.parse(localStorage.getItem("members") || "[]");
    updateMembers = false;
    memberList.forEach(name => {
        nameInput.value = name;
        addParticipant();
    });
    updateMembers = true;

    const dropdown = document.getElementById("select");
    const groupSize = parseInt(localStorage.getItem("groupSize") || "3");
    if (groupSize != 3) {
        dropdown.value = "" + groupSize;
    }
    dropdown.onchange = event => {
        localStorage.setItem("groupSize", dropdown.value);
    };
}

function loadLanguageIcon() {
    const languageIcon = document.getElementById("languageIcon");
    const optionsDiv = document.createElement("div");
    optionsDiv.classList.add("box");
    optionsDiv.classList.add("language-options");

    Object.keys(languages).forEach(lang_id => {
        const option = document.createElement("div");
        option.appendChild(document.createTextNode(languages[lang_id].lang_name));

        option.className = "language-option";
        option.onclick = event => {
            languageIcon.parentNode.removeChild(optionsDiv);
            selectLanguage(lang_id);
        };
        optionsDiv.appendChild(option);
        languages[lang_id]._option = option;
    });

    languageIcon.onclick = event => {
        if (languageIcon.parentNode.children[1] === optionsDiv) {
            languageIcon.parentNode.removeChild(optionsDiv);
            return;
        }
        languageIcon.parentNode.appendChild(optionsDiv);
    }
    languageIcon.parentNode.onblur = event => {
        languageIcon.parentNode.removeChild(optionsDiv);
    };
}

function selectLanguage(lang_id) {
    if (lang_id === selectLanguage) {
        return;
    }
    localStorage.setItem("language", lang_id);
    if (selectedLanguage) {
        languages[selectedLanguage]._option.classList.remove("language-option-selected");
    }
    selectedLanguage = lang_id;

    languages[lang_id]._option.classList.add("language-option-selected");

    const translatedElements = document.querySelectorAll("[data-trans]");
    translatedElements.forEach(el => {
        const translationKey = el.getAttribute("data-trans");
        const translated = getTranslation(translationKey);
        if (translated !== translationKey)
            el.textContent = translated;
    });
}

function getTranslation(langKey) {
    const translatedValue = languages[selectedLanguage][langKey];
    if (!translatedValue) {
        console.log("Key " + langKey + " could not be found in language " + selectedLanguage + ".");
        return langKey;
    }
    return translatedValue;
}

function loadTrash() {
    const trash = document.getElementById("trash");
    trash.ondragover = event => {
        trash.classList.add("trash-selected");
        event.preventDefault();
    }
    trash.ondragleave = event => {
        trash.classList.remove("trash-selected");
    }
    trash.ondrop = event => {
        delete participants[dragged.participantName];
        dragged.parentNode.removeChild(dragged);
        dragged = null;
        trash.classList.remove("trash-selected");
        localStorage.setItem("members", JSON.stringify(Object.keys(participants)));
    }
    trash.onclick = event => {
        var confirmMessage = getTranslation("confirm-trash-all");
        const really = confirm(confirmMessage);
        if (really) {
            const pList = Object.keys(participants);
            for (var i = pList.length - 1; i >= 0; i--) {
                const node = participants[pList[i]];
                node.parentNode.removeChild(node);
                delete participants[pList[i]];
            }
        }
    }
}

function makePlaceholder() {
    placeholder = document.createElement("div");
    placeholder.classList.add("participant");
    placeholder.classList.add("placeholder");
    placeholder.appendChild(document.createTextNode(""));
}

function insertInto(el, box, event) {
    const isHorizontal = box.id === "dropbox5";
    const children = box.children;
    for (var i = 0; i < children.length; i++) {
        const child = children[i];
        const rect = child.getBoundingClientRect();
        if ((rect.bottom >= event.clientY && !isHorizontal) || ((rect.left+rect.right)*0.5 >= event.clientX && isHorizontal)) {
            if (child === el) return;
            if (el.parentNode) el.parentNode.removeChild(el);
            box.insertBefore(el, child);
            return;
        }
    }
    if (box.lastChild === el) return;
    if (el.parentNode) el.parentNode.removeChild(el);
    box.appendChild(el);
    return;
}

function loadDropbox(id) {
    const box = document.getElementById(id);
    boxes.push(box);

    box.ondragover = event => {
        event.preventDefault();

        insertInto(placeholder, box, event);
    };
    box.ondrop = event => {
        if (placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
        event.preventDefault();

        insertInto(dragged, box, event);
    };
}

function addParticipant() {
    let name = nameInput.value;
    if (name == "" || name in participants) {
        return;
    }
    console.log("Added participant " + name);
    const newElement = document.createElement("div");
    const newContent = document.createTextNode(nameInput.value);
    newElement.appendChild(newContent);
    newElement.className = "participant";
    newElement.draggable = true;
    newElement.participantName = name;

    participants[name] = newElement;

    const unsortedBox = boxes[4];
    unsortedBox.appendChild(newElement);
    nameInput.value = nameInput.defaultValue;

    newElement.ondragstart = event => {
        dragged = newElement;
        
        setTimeout(() => {
            placeholder.firstChild.textContent = newElement.firstChild.textContent;

            newElement.hidden = true;
            insertInto(placeholder, newElement.parentNode, event);
        },0);
    };

    newElement.ondragend = event => {
        newElement.hidden = false;
        if (placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
        }
    };
    if (updateMembers) {
        localStorage.setItem("members", JSON.stringify(Object.keys(participants)));
    }
}

function retrieve() {
    const unsortedBox = boxes[4];
    Object.values(participants).forEach(p => {
        if (p.parentNode === boxes[3] || p.parentNode === boxes[4])
            return;
        p.parentNode.removeChild(p);
        unsortedBox.appendChild(p);
    });
}

function distribute() {
    const dropdown = document.getElementById("select");
    const groupSize = parseInt(dropdown.value);

    const memberCounts = [0, 0, 0, 0, 0];
    for (var i = 0; i < 5; i++) {
        memberCounts[i] = boxes[i].children.length;
    }
    // Choose random permutation of unsorted members, and orphan all unassigned participants.

    const permutation = [];
    for (var i = 0; i < memberCounts[4]; i++) {
        permutation.push(boxes[4].children[i]);
    }
    for (var i = 0; i < memberCounts[4]; i++) {
        boxes[4].removeChild(boxes[4].lastChild);
    }
    shuffle(permutation);
    
    var remainingGroup1 = groupSize - memberCounts[0];
    var remainingGroup2 = groupSize - memberCounts[1];
    
    while (remainingGroup1 > 0 || remainingGroup2 > 0) {
        if (permutation.length == 0) return;
        // Choose the smaller group if unequal, otherwise random
        if (remainingGroup1 < remainingGroup2 + Math.random() - 0.5) {
            boxes[1].appendChild(permutation.pop());
            remainingGroup2--;
        } else {
            boxes[0].appendChild(permutation.pop());
            remainingGroup1--;
        }
    }
    while (permutation.length > 0) {
        boxes[2].appendChild(permutation.pop());
    }
}

function shuffle(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        const j = randint(i, arr.length);
        const swap = arr[i];
        arr[i] = arr[j];
        arr[j] = swap;
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function onClickLanguageIcon() {

}