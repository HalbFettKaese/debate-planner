const participants = {};
const boxes = [];
let dragged = null;
var nameInput;
var placeholder;
var selectedLanguage = null;
var allowSavingMembers;
var roleButton;
function initialize() {
    makePlaceholder();
    
    loadRoleButton();

    [
        "dropbox1", "dropbox2", "dropbox3", "dropbox4", "dropbox5"
    ].forEach((id, idx) => loadDropbox(id, idx));

    nameInput = document.getElementById("nameInput");
    nameInput.onkeydown = event => {
        if (event.key === "Enter") {
            let name = nameInput.value;
            const role = parseInt(roleButton.dataset.currentRole);
            addParticipant(name, role);
            saveMembers();
            nameInput.value = nameInput.defaultValue;
        }
    };

    loadTrash();

    loadLanguageIcon();

    selectedLanguage = localStorage.getItem("language") || "en";

    selectLanguage(selectedLanguage);

    loadMembers();

    const dropdown = document.getElementById("select");
    const groupSize = parseInt(localStorage.getItem("groupSize") || "3");
    if (groupSize != 3) {
        dropdown.value = "" + groupSize;
    }
    dropdown.onchange = event => {
        localStorage.setItem("groupSize", dropdown.value);
    };
}

function loadRoleButton() {
    roleButton = document.getElementById("roleButton");
    roleButton.dataset.currentRole = 0;
    roleButton.onclick = event => {
        const newRole = (parseInt(roleButton.dataset.currentRole) + 1) % 2;
        roleButton.dataset.currentRole = newRole;
        if (newRole == "0") {
            roleButton.classList.remove("role-button-beginner");
            roleButton.dataset.trans = "role-regular";
        } else {
            roleButton.classList.add("role-button-beginner");
            roleButton.dataset.trans = "role-beginner";
        }
        translateElement(roleButton);
    }
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
    translatedElements.forEach(translateElement);
}

function translateElement(el) {
    const translated = getTranslation(el.dataset.trans);
    if (translated !== el.dataset.trans)
        el.textContent = translated;
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
        delete participants[dragged.dataset.participantName];
        dragged.parentNode.removeChild(dragged);
        dragged = null;
        trash.classList.remove("trash-selected");
        saveMembers();
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

function saveMembers() {
    if (!allowSavingMembers) return;
    const saved = [];
    Object.keys(participants).forEach(name => {
        saved.push([name, participants[name].dataset.role]);
    });
    localStorage.setItem("members", JSON.stringify(saved));
    localStorage.setItem("membersDataFormat", 1);
}

function loadMembers() {
    allowSavingMembers = false;
    const membersDataFormat = parseInt(localStorage.getItem("membersDataFormat") || "0");
    const membersList = JSON.parse(localStorage.getItem("members") || "[]");
    if (membersDataFormat == 0) {
        membersList.forEach(name => addParticipant(name, 0));
    } else {
        membersList.forEach(([name, role],) => addParticipant(name, role));
    }
    allowSavingMembers = true;
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

function addParticipant(name, role) {
    if (name == "" || name in participants) {
        return;
    }
    console.log("Added participant " + name);
    const newElement = document.createElement("div");
    const newContent = document.createTextNode(name);
    newElement.appendChild(newContent);
    newElement.className = "participant";
    newElement.draggable = true;
    newElement.dataset.participantName = name;

    newElement.dataset.role = role;
    if (role == 1) {
        newElement.classList.add("beginner-participant");
    }

    participants[name] = newElement;

    const unsortedBox = boxes[4];
    unsortedBox.appendChild(newElement);

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

    const beginners = [];
    const normals = [];

    for (var i = 0; i < memberCounts[4]; i++) {
        const node = boxes[4].children[i];
        if (parseInt(node.dataset.role) == 0) {
            normals.push(node);
        } else {
            beginners.push(node);
        }
    }
    for (var i = 0; i < memberCounts[4]; i++) {
        boxes[4].removeChild(boxes[4].lastChild);
    }
    shuffle(beginners);
    shuffle(normals);
    
    var groupTotal1 = memberCounts[0];
    var groupNormals1 = Array.from(boxes[0].children).filter(el => parseInt(el.dataset.role) == 0).length;
    var groupTotal2 = memberCounts[1];
    var groupNormals2 = Array.from(boxes[1].children).filter(el => parseInt(el.dataset.role) == 0).length;
    // Distribute members of beginners and normals such that number of normals and totals is mostly equal
    // First, try to mitigate any starting differences
    // Mitigate differing normals count
    function equalizeNormalCount() {
        if (groupNormals1 == groupNormals2) // Nothing to do if already equal
            return;
        if (groupNormals1 < groupNormals2) {
            while (groupTotal1 < groupSize && groupNormals1 < groupNormals2 && normals.length > 0) {
                groupTotal1++;
                groupNormals1++;
                boxes[0].appendChild(normals.pop());
            }
            return;
        }
        while (groupTotal2 < groupSize && groupNormals2 < groupNormals1 && normals.length > 0) {
            groupTotal2++;
            groupNormals2++;
            boxes[1].appendChild(normals.pop());
        }
    }
    equalizeNormalCount();

    // If group 1 and 2 have no normals and the unsorted only have one normal, always put the remainder into one of the groups
    if (groupNormals1 == 0 && groupNormals2 == 0 && normals.length == 1) {
        var targetGroup;
        if (groupTotal1 < groupSize) {
            if (groupTotal2 < groupSize) {
                // Both groups have space, so add to random group
                targetGroup = Math.random() < 0.5 ? 1 : 2;
            } else {
                // Group 1 has space, group 2 doesn't, so always add to group 1
                targetGroup = 1;
            }
        } else {
            if (groupTotal2 < groupSize) {
                // Group 2 has space, group 1 doesn't, so always add to group 2
                targetGroup = 2;
            } else {
                // No group has space, so skip
                targetGroup = -1;
            }
        }
        if (targetGroup == 1) {
            groupNormals1 += 1;
            groupTotal1 += 1;
            boxes[0].appendChild(normals.pop());
        } else if (targetGroup == 2) {
            groupNormals2 += 1;
            groupTotal2 += 1;
            boxes[1].appendChild(normals.pop());
        }
    }
    // Mitigate differing total counts
    function equalizeTotalCount() {
        if (groupTotal1 == groupTotal2) {
            return;
        }
        if (groupTotal1 < groupTotal2) {
            while (groupTotal1 < groupTotal2 && beginners.length > 0) {
                groupTotal1 += 1;
                boxes[0].appendChild(beginners.pop());
            }
            return;
        }
        while (groupTotal2 < groupTotal1 && beginners.length > 0) {
            groupTotal2 += 1;
            boxes[1].appendChild(beginners.pop());
        }
    }
    equalizeTotalCount();
    if (groupTotal1 != groupTotal2) {
        console.log("Total group sizes are " + groupTotal1 + " and " + groupTotal2 + " when they should be equal at this point.");
    }
    // Now, both groups have equal members and (mostly) equal normals.
    // Add pairs of one kind to both groups until groups are full or pairs are exhausted.
    var beginnerPairCount = Math.floor(beginners.length / 2);
    var normalPairCount = Math.floor(normals.length / 2);
    while (beginnerPairCount + normalPairCount > 0 && groupTotal1 < groupSize) {
        var diceRoll = Math.random() * (beginnerPairCount + normalPairCount);
        var chooseBeginner = diceRoll < beginnerPairCount;
        if (normalPairCount > 0 && (groupNormals1 == 0 || groupNormals2 == 0)) {
            // Make sure there is at least one pair of normals to guide the beginners in each group
            chooseBeginner = false;
        }
        if (chooseBeginner) {
            // pick pair of beginners
            boxes[0].appendChild(beginners.pop());
            boxes[1].appendChild(beginners.pop());
            beginnerPairCount--;
        } else {
            // pick pair of normals
            boxes[0].appendChild(normals.pop());
            boxes[1].appendChild(normals.pop());
            normalPairCount--;
            groupNormals1++;
            groupNormals2++;
        }
        groupTotal1++;
        groupTotal2++;
    }
    // Now either pairs are exhausted or groups are full.

    if (groupTotal1 < groupSize) {
        // Groups are not full, so pairs are exhausted.
        // normals and beginners might still have each one member left.
        var node1 = beginners.pop();
        var node2 = normals.pop();
        // Swap the two nodes randomly
        if (Math.random() < 0.5) {
            [node1, node2] = [node2, node1];
        }
        if (node1) {
            boxes[0].appendChild(node1);
        }
        if (node2) {
            boxes[1].appendChild(node2);
        }
    } else {
        // Groups are full and there might be members left, so add the remaining members to be free speakers
        while (beginners.length > 0) {
            boxes[2].appendChild(beginners.pop());
        }
        while (normals.length > 0) {
            boxes[2].appendChild(normals.pop());
        }
    }
    if (beginners.length > 0 || normals.length > 0) {
        console.log("(beginners, normals).length was", beginners.length, normals.length, "when both should be 0.");
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
