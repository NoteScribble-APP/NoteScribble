const dbName = "NoteScribble";
const noteObjectStoreName = "Notes";
const reminderObjectStoreName = "Reminders";

let db;

const request = indexedDB.open(dbName, 1);

request.onerror = function (event) {
  console.log("Error al generar la base de datos", event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Base de datos generada correctamente");
};

request.onupgradeneeded = function (event) {
  db = event.target.result;

  if (!db.objectStoreNames.contains(noteObjectStoreName)) {
    const notesObjectStore = db.createObjectStore(noteObjectStoreName, {
      keyPath: "id",
      autoIncrement: true,
    });
    notesObjectStore.createIndex("titulo", "titulo", { unique: false });
    notesObjectStore.createIndex("contenido", "contenido", { unique: false });
    notesObjectStore.createIndex("idUser", "idUser", { unique: false });
    notesObjectStore.createIndex("id2", "id2", { unique: false });

    console.log("Tabla 'Notes' creada con exito");
  }

  if (!db.objectStoreNames.contains(reminderObjectStoreName)) {
    const remindersObjectStore = db.createObjectStore(reminderObjectStoreName, {
      keyPath: "id",
      autoIncrement: true,
    });
    remindersObjectStore.createIndex("titulo", "titulo", { unique: false });
    remindersObjectStore.createIndex("contenido", "contenido", {
      unique: false,
    });
    remindersObjectStore.createIndex("fecha", "fecha", { unique: false });
    remindersObjectStore.createIndex("hora", "hora", { unique: false });
    remindersObjectStore.createIndex("idUser", "idUser", { unique: false });
    remindersObjectStore.createIndex("id2", "id2", { unique: false });

    console.log("Tabla 'Reminders' creada con exito");
  }
};

document.getElementById("btnAddNote").addEventListener("click", function () {
  const noteTitle = document.getElementById("inputTitle").value;
  const noteContent = document.getElementById("inputContent").value;
  const userId = localStorage.getItem("accessToken");
  const id2 = Date.now();

  addNote(noteTitle, noteContent, userId, id2);
});

//*** ADDNOTES ***/
function addNote(titulo, contenido, userId, id2) {
  const transaction = db.transaction([noteObjectStoreName], "readwrite");
  const notesObjectStore = transaction.objectStore(noteObjectStoreName);

  const newNote = {
    titulo: titulo,
    contenido: contenido,
    idUser: userId,
    id2: id2,
  };

  const request = notesObjectStore.add(newNote);

  request.onsuccess = function (event) {
    alert("Nota agregada con éxito");
  };

  request.onerror = function (event) {
    alert("Error al agregar la nota");
    console.error(event.target.errorCode);
  };
}

//*** VIEWNOTES ***//

function showNotes() {
  document.getElementById("formularioNota").classList.add("hidden");

  const userId = localStorage.getItem("accessToken");

  const transaction = db.transaction([noteObjectStoreName], "readonly");
  const notesObjectStore = transaction.objectStore(noteObjectStoreName);

  let request;

  if (userId) {
    request = notesObjectStore.index("idUser").getAll(IDBKeyRange.only(userId));
  } else {
    request = notesObjectStore.getAll();
  }

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
        contentElement.style.marginBottom = "10px";

        noteContainer.appendChild(titleElement);
        noteContainer.appendChild(contentElement);

        const editButton = document.createElement("button");
        editButton.textContent = "Editar";
        editButton.style.marginRight = "10px";
        editButton.classList.add(
          "bg-yellow-500",
          "text-white",
          "py-2",
          "px-4",
          "rounded",
          "border",
          "border-blue-700",
          "hover:bg-blue-700",
          "hover:border-blue-900",
          "transition",
          "duration-300",
          "ease-in-out",
          "transform",
          "hover:scale-105"
        );
        editButton.addEventListener("click", function () {
          editNote(index);
        });
        noteContainer.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Eliminar";
        deleteButton.classList.add(
          "bg-red-500",
          "text-white",
          "py-2",
          "px-4",
          "rounded",
          "border",
          "border-blue-700",
          "hover:bg-blue-700",
          "hover:border-blue-900",
          "transition",
          "duration-300",
          "ease-in-out",
          "transform",
          "hover:scale-105"
        );
        deleteButton.addEventListener("click", function () {
          deleteNote(index);
          showNotes();
        });
        noteContainer.appendChild(deleteButton);

        notasList.appendChild(noteContainer);

        const separator = document.createElement("hr");
        separator.style.marginBottom = "20px";
        separator.style.marginTop = "20px";
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
    contenido: editedContent,
    idUser: nota.idUser,
    id2: nota.id2,
  };

  const updateRequest = notesObjectStore.put(notaActualizada);

  updateRequest.onsuccess = function (event) {
    console.log("Nota actualizada con éxito en la base de datos");
    closeEditForm();
    showNotes();
  };

  updateRequest.onerror = function (event) {
    console.error(
      "Error al actualizar la nota en la base de datos",
      event.target.error
    );
  };
}

function obtenerNotaActual() {
  return nota;
}

//***** RECORDATORIOS ******/

function addReminder(titulo, contenido, userId, fecha, hora, id2) {
  const transaction = db.transaction([reminderObjectStoreName], "readwrite");
  const remindersObjectStore = transaction.objectStore(reminderObjectStoreName);

  const newReminder = {
    titulo: titulo,
    contenido: contenido,
    idUser: userId,
    fecha: fecha,
    hora: hora,
    id2: id2,
  };

  const request = remindersObjectStore.add(newReminder);

  request.onsuccess = function (event) {
    console.log("Recordatorio agregado con éxito");
    alert("Recordatorio agregado con éxito");
  };

  request.onerror = function (event) {
    console.log("Error al agregar recordatorio", event.target.errorCode);
    alert("Error al agregar recordatario");
  };
}

function AddReminderbtn() {
  const reminderTitle = document.getElementById("eventTitle").value;
  const reminderContent = document.getElementById("eventDescription").value;
  const reminderDate = document.getElementById("eventDate").value;
  const reminderTime = document.getElementById("eventTime").value;
  const userId = localStorage.getItem("accessToken");
  const id2 = Date.now();

  addReminder(
    reminderTitle,
    reminderContent,
    userId,
    reminderDate,
    reminderTime,
    id2
  );
}

function showReminders() {
  const userId = localStorage.getItem("accessToken");

  const remindersList = document.getElementById("remindersList");
  const sinReminders = document.getElementById("sinReminders");

  remindersList.innerHTML = "";

  const transaction = db.transaction([reminderObjectStoreName], "readonly");
  const remindersObjectStore = transaction.objectStore(reminderObjectStoreName);

  let request;

  if (userId) {
    request = remindersObjectStore
      .index("idUser")
      .getAll(IDBKeyRange.only(userId));
  } else {
    request = remindersObjectStore.getAll();
  }

  request.onsuccess = function (event) {
    const reminders = event.target.result;
    //console.log("Reminders obtenidos:", reminders);

    if (reminders.length > 0) {
      reminders.forEach(function (reminder, index) {
        //console.log("Mostrando reminder:", reminder);

        const reminderContainer = document.createElement("div");

        const titleElement = document.createElement("h3");
        const contentElement = document.createElement("p");
        const dateElement = document.createElement("p");
        const timeElement = document.createElement("p");

        titleElement.textContent = `Titulo: ${reminder.titulo}`;
        contentElement.textContent = `Descripcion: ${reminder.contenido}`;
        dateElement.textContent = `Fecha: ${reminder.fecha}`;
        timeElement.textContent = `Hora: ${reminder.hora}`;

        reminderContainer.appendChild(titleElement);
        reminderContainer.appendChild(contentElement);
        reminderContainer.appendChild(dateElement);
        reminderContainer.appendChild(timeElement);

        const editButtonR = document.createElement("button");
        editButtonR.textContent = "Editar";
        editButtonR.style.marginRight = "10px";
        editButtonR.classList.add(
          "bg-yellow-500",
          "text-white",
          "py-2",
          "px-4",
          "rounded",
          "border",
          "border-blue-700",
          "hover:bg-blue-700",
          "hover:border-blue-900",
          "transition",
          "duration-300",
          "ease-in-out",
          "transform",
          "hover:scale-105"
        );
        editButtonR.addEventListener("click", function () {
          editReminder(index);
        });

        reminderContainer.appendChild(editButtonR);

        const deleteButtonR = document.createElement("button");
        deleteButtonR.textContent = "Eliminar";
        deleteButtonR.classList.add(
          "bg-red-500",
          "text-white",
          "py-2",
          "px-4",
          "rounded",
          "border",
          "border-blue-700",
          "hover:bg-blue-700",
          "hover:border-blue-900",
          "transition",
          "duration-300",
          "ease-in-out",
          "transform",
          "hover:scale-105"
        );
        deleteButtonR.addEventListener("click", function () {
          deleteReminder(index);
          showReminders();
        });

        reminderContainer.appendChild(deleteButtonR);

        remindersList.appendChild(reminderContainer);

        const separator = document.createElement("hr");
        separator.style.marginBottom = "20px";
        separator.style.marginTop = "20px";
        remindersList.appendChild(separator);
      });

      sinReminders.classList.add("hidden");
    } else {
      sinReminders.classList.remove("hidden");
    }

    document.getElementById("listadoReminders").classList.remove("hidden");
  };

  request.onerror = function (event) {
    console.error("Error al obtener recordatorios:", event.target.error);
  };
}

var reminder;

function editReminder(index) {
  const transaction = db.transaction([reminderObjectStoreName], "readonly");
  const remindersObjectStore = transaction.objectStore(reminderObjectStoreName);

  const request = remindersObjectStore.getAll();

  request.onsuccess = function (event) {
    const reminders = event.target.result;

    if (index >= 0 && index < reminders.length) {
      reminder = reminders[index];
      showEditReminderForm(reminder);
    }
  };

  console.log("editando recordatorio con el indice: ", index);
}

function showEditReminderForm(reminder) {
  const editTitleInput = document.getElementById("editTitle");
  const editContentInput = document.getElementById("editContent");
  const editDateInput = document.getElementById("editDate");
  const editTimeInput = document.getElementById("editTime");

  editTitleInput.value = reminder.titulo;
  editContentInput.value = reminder.contenido;
  editDateInput.value = reminder.fecha;
  editTimeInput.value = reminder.hora;

  const editModal = document.getElementById("editModal");
  editModal.classList.toggle("hidden", false);
}

function closeEditReminderForm() {
  const editModal = document.getElementById("editModal");
  editModal.classList.toggle("hidden", true);
}

function saveEditReminder() {
  const editedTitle = document.getElementById("editTitle").value;
  const editedContent = document.getElementById("editContent").value;
  const editedDate = document.getElementById("editDate").value;
  const editedTime = document.getElementById("editTime").value;

  const reminder = obtenerNotaActualR();

  const transaction = db.transaction([reminderObjectStoreName], "readwrite");
  const remindersObjectStore = transaction.objectStore(reminderObjectStoreName);

  const recordatorioActualizado = {
    id: reminder.id,
    titulo: editedTitle,
    contenido: editedContent,
    fecha: editedDate,
    hora: editedTime,
    idUser: reminder.idUser,
    id2: reminder.id2,
  };

  const updateRequest = remindersObjectStore.put(recordatorioActualizado);

  updateRequest.onsuccess = function (event) {
    console.log("Recordatorio actualizado con éxito en la base de datos");
    closeEditReminderForm();
    showReminders();
  };

  updateRequest.onerror = function (event) {
    console.error(
      "Error al actualizar la nota en la base de datos",
      event.target.error
    );
  };
}

function obtenerNotaActualR() {
  return reminder;
}

function deleteReminder(index) {
  const transaction = db.transaction([reminderObjectStoreName], "readwrite");
  const remindersObjectStore = transaction.objectStore(reminderObjectStoreName);

  const request = remindersObjectStore.getAll();

  request.onsuccess = function (event) {
    const reminders = event.target.result;

    if (index >= 0 && index < reminders.length) {
      const keyToDelete = reminders[index].id;

      const deleteRequest = remindersObjectStore.delete(keyToDelete);

      deleteRequest.onsuccess = function () {
        console.log("Recordatorio eliminado con éxito");
      };

      deleteRequest.onerror = function () {
        console.error("Error al eliminar el recordatorio");
      };
    }
  };
  // console.log("Eliminando recordatorio con el indice: ", index)
}
