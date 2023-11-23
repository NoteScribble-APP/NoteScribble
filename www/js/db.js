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
            notas.forEach(function (nota) {
                const li = document.createElement("li");
                li.textContent = `${nota.titulo}: ${nota.contenido}`;
                notasList.appendChild(li);
            });
            sinNotas.classList.add("hidden");
        } else {
            sinNotas.classList.remove("hidden");
        }

        document.getElementById("listadoNotas").classList.remove("hidden");
    };
}

document.getElementById("btnViewNotes").addEventListener("click", showNotes);


