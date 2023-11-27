function RegisterUser() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  const userData = {
    name: username,
    email: email,
    password: password,
  };

  fetch("http://localhost:3000/api/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log("Error al realizar solicitud: ", error);
    });
}

function LoginUser() {
  const password = document.getElementById("password").value;
  const email = document.getElementById("email").value;

  const loginData = {
    email: email,
    password: password,
  };

  fetch("http://localhost:3000/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      const accessToken = data.user._id;
      if (accessToken !== undefined && accessToken !== null) {
        localStorage.setItem("accessToken", accessToken);
        //saveNotesLocally(data.notas);

        alert("Sesión iniciada correctamente");
        console.log(data);

        window.location.href = "../app/Notes.html";
      } else {
        console.log("No se recibió un token válido.");
        console.log(data);
      }
    })
    .catch((error) => {
      alert("Error al iniciar sesion, revisa tus campos");
      console.log("Error al realizar solicitud: ", error);
    });
}
