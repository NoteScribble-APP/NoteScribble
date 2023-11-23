
//*** NAVBAR ***//

const navButton = document.querySelector("#menu-button");
  
const menuItems = document.querySelector("#menu");

const menuButtonSpan = document.querySelectorAll("#menu-button span");

const enlaces = document.querySelectorAll("#menu a");

//funcionalidad a boton de navbar movil
navButton.addEventListener("click", () => {
  menuItems.classList.toggle("hidden");
  
  menuButtonSpan.forEach((span) => {
    span.classList.toggle("anim");
  });
});

//Cerrar menu al dar click en un enlace
enlaces.forEach((link) => {
  link.addEventListener("click", () => {
    menuItems.classList.add("hidden");
    
    menuButtonSpan.forEach((span) => {
      span.classList.remove("anim");
    });
  });
});

//*** MOSTRAR FORMULARIO Y NOTAS ***/
document.addEventListener("DOMContentLoaded", function () {
  
  function mostrarFormulario() {
    document.getElementById("formularioNota").classList.remove("hidden");
  }

  function ocultarNotas() {
    document.getElementById("listadoNotas").classList.add("hidden");
  }

  document.getElementById("btnMostrarFormulario").addEventListener("click", function () {
    mostrarFormulario();
    ocultarNotas();
  });
});
