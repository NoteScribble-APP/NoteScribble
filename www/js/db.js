const dbName = "NoteScribble"
const noteObjectStoreName = "Notes";

let db;

const request = indexedDB.open(dbName, 1);

request.onerror = function(event){
    console.log("Error al generar la base de datos", event.target.errorCode);
};

request.onsuccess = function(event){
    db = event.target.result;
    console.log("Base de datos generada correctamente");
};

request.onupgradeneeded = function(event){
    db = event.target.result;

    if(!db.objectStoreNames.contains(noteObjectStoreName)){
        const notesObjectStore = db.createObjectStore(noteObjectStoreName, {keyPath: "id", autoIncrement: true});
        notesObjectStore.createIndex("titulo", "titulo", {unique: false});
        notesObjectStore.createIndex("contenido", "contenido", {unique: false});

        console.log("Tabla 'Notes' creada con exito");
    }
}

//*** ADDNOTES ***/
function addNote(titulo, contenido) {
    const transaction = db.transaction([noteObjectStoreName], "readwrite");

    const notesObjectStore = transaction.objectStore(noteObjectStoreName);

    const newNote = { titulo: titulo, contenido: contenido };

    const request = notesObjectStore.add(newNote);

    request.onsuccess = function (event) {
        alert("Nota agregada con éxito");
    };

    request.onerror = function (event) {
        alert("Error al agregar la nota");
        console.error(event.target.errorCode);
    };
}

document.getElementById("btnAddNote").addEventListener("click", function () {
    const noteTitle = document.getElementById("inputTitle").value;
    const noteContent = document.getElementById("inputContent").value;

    addNote(noteTitle, noteContent);
});

//*** VIEWNOTES ***//

function showNotes() {
    document.getElementById("formularioNota").classList.add("hidden");

    const transaction = db.transaction([noteObjectStoreName], "readonly");
    const notesObjectStore = transaction.objectStore(noteObjectStoreName);

    const request = notesObjectStore.getAll();

    request.onsuccess = function (event) {
        const notas = event.target.result;

        const notasList = document.getElementById("notasList");
        const sinNotas = document.getElementById("sinNotas");

        notasList.innerHTML = "";

        if (notas.length > 0) {
            notas.forEach(function (nota, index) {
                
                const noteContainer = document.createElement("div");
                
                const titleElement = document.createElement("h3");
                const contentElement = document.createElement("p");

                titleElement.textContent = `Título: ${nota.titulo}`;
                titleElement.style.marginBottom = "10px";
                contentElement.textContent = `Descripción: ${nota.contenido}`;
                contentElement.style.marginBottom = "10px"
                
                noteContainer.appendChild(titleElement);
                noteContainer.appendChild(contentElement);

                const editButton = document.createElement("button");
                editButton.textContent = "Editar";
                editButton.style.marginRight = "10px"
                editButton.classList.add("bg-blue-500", "text-white", "py-2", "px-4", "rounded", "border",  "border-blue-700", "hover:bg-blue-700", "hover:border-blue-900", "transition", "duration-300", "ease-in-out", "transform", "hover:scale-105");
                editButton.addEventListener("click", function () {
                    editNote(index);
                });
                noteContainer.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Eliminar";
                deleteButton.classList.add("bg-blue-500", "text-white", "py-2", "px-4", "rounded", "border",  "border-blue-700", "hover:bg-blue-700", "hover:border-blue-900", "transition", "duration-300", "ease-in-out", "transform", "hover:scale-105");
                deleteButton.addEventListener("click", function () {
                    deleteNote(index);
                    showNotes();
                });
                noteContainer.appendChild(deleteButton);

                notasList.appendChild(noteContainer);

                const separator = document.createElement("hr");
                separator.style.marginBottom = "20px"
                separator.style.marginTop = "20px"
                notasList.appendChild(separator);
            });

            notasList.removeChild(notasList.lastChild);

            sinNotas.classList.add("hidden");
        } else {
            sinNotas.classList.remove("hidden");
        }

        document.getElementById("listadoNotas").classList.remove("hidden");
    };
}

document.getElementById("btnViewNotes").addEventListener("click", showNotes);

function deleteNote(index) {
    const transaction = db.transaction([noteObjectStoreName], "readwrite");
    const notesObjectStore = transaction.objectStore(noteObjectStoreName);

    const request = notesObjectStore.getAll();

    request.onsuccess = function (event) {
        const notas = event.target.result;

        if (index >= 0 && index < notas.length) {

            const keyToDelete = notas[index].id;

            const deleteRequest = notesObjectStore.delete(keyToDelete);

            deleteRequest.onsuccess = function () {
                console.log("Nota eliminada con éxito");
            };

            deleteRequest.onerror = function () {
                console.error("Error al eliminar la nota");
            };
        }
    };
}

let nota;

function editNote(index) {
    const transaction = db.transaction([noteObjectStoreName], "readonly");
    const notesObjectStore = transaction.objectStore(noteObjectStoreName);

    const request = notesObjectStore.getAll();

    request.onsuccess = function (event) {
        const notas = event.target.result;

        if (index >= 0 && index < notas.length) {
            nota = notas[index];
            showEditForm(nota);
        }
    };
}

function showEditForm(nota) {

    const editTitleInput = document.getElementById("editTitle");
    const editContentInput = document.getElementById("editContent");
    
    editTitleInput.value = nota.titulo;
    editContentInput.value = nota.contenido;

    const editModal = document.getElementById("editModal");
    editModal.classList.toggle("hidden", false);
  }

  function closeEditForm() {
    const editModal = document.getElementById("editModal");
    editModal.classList.toggle("hidden", true);
}

function saveEdit() {

    const editedTitle = document.getElementById("editTitle").value;
    const editedContent = document.getElementById("editContent").value;

    const nota = obtenerNotaActual();

    const transaction = db.transaction([noteObjectStoreName], "readwrite");
    const notesObjectStore = transaction.objectStore(noteObjectStoreName);

    const notaActualizada = {
        id: nota.id,
        titulo: editedTitle,
        contenido: editedContent
    };

    const updateRequest = notesObjectStore.put(notaActualizada);

    updateRequest.onsuccess = function (event) {
        console.log("Nota actualizada con éxito en la base de datos");
        closeEditForm();
        showNotes();
    };

    updateRequest.onerror = function (event) {
        console.error("Error al actualizar la nota en la base de datos", event.target.error);
    };
}

function obtenerNotaActual() {
    return nota;
}