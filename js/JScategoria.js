// const formulario = document.getElementById("formCategoria");
// const categoria = document.getElementById("nombre");
// const descripcion = document.getElementById("descripcion");
// const margenGanancia = document.getElementById("margen_ganancia");
// const estado = document.getElementById("estado");
// const btnGuardar = document.getElementById("btnGuardar");
// const btnCancelar = document.getElementById("btnCancelar");

// btnCancelar.addEventListener("click", function(){
//         window.location.href = "categoria.php";
//     });

// ///////////////////LIMPIAR TODOS LOS CAMPOS///////////
// function limpiarCampos() {
//     campos.forEach(function (campo) {
//         campo.value = "";
//         campo.classList.remove("is-invalid");
//         campo.classList.remove("is-valid");
//     });
//     estado.value = "activo";
// }


// function validarCampo(campo) {
//     const vacio = campo.value.trim() === "";
//     campo.classList.toggle("is-invalid", vacio);
//     campo.classList.toggle("is-valid", !vacio);

//     return !vacio;
// }
// const campos = [categoria, descripcion, margenGanancia];

// if (formulario) {

//     ////////////////////VALIDACION DE CAMPOS VACIOS
//     campos.forEach(function (campo) {
//         campo.addEventListener("blur", function () {
//             validarCampo(campo);
//         });
//     });
//     ////////////////////PASAR TODO A MAYUSCULAS
//     const campos1 = [categoria, descripcion];

//     campos1.forEach(function (campo) {
//         campo.addEventListener("input", function () {
//             campo.value = campo.value.toUpperCase();
//             validarCampo(campo);
//         });
//     });


//     btnGuardar.addEventListener("click", async function () {

//         // 1. Capturar el elemento del input del margen de ganancia (asegúrate de que el id en tu HTML sea 'margen_ganancia')
//         const valorMargen = parseFloat(margenGanancia.value);

//         // 2. Validar campos de texto generales (usando && en lugar de coma)
//         const categoriaValido = validarCampo(categoria);

//         // 3. Validar el margen de ganancia específicamente
//         let margenValido = true;
//         let mensajeErrorMargen = "";

//         if (isNaN(valorMargen) || margenGanancia.value.trim() === "") {
//             margenValido = false;
//             mensajeErrorMargen = "El margen de ganancia es obligatorio y debe ser un número.";
//         } else if (valorMargen <= 0) {
//             margenValido = false;
//             mensajeErrorMargen = "El margen de ganancia no puede ser negativo ni cero";
//         } else if (valorMargen > 100) { 
//             margenValido = false;
//             mensajeErrorMargen = "El margen de ganancia no puede superar el 100%.";
//         }

//         if (!margenValido) {
//             notificar("danger", mensajeErrorMargen);
//             margenGanancia.focus();
//             return;
//         }

//         if (btnGuardar.textContent.trim() == "Guardar") {

//             if (categoriaValido && margenValido) {
//                 try {
//                     const datos = new FormData(formulario);
//                     datos.append("opcion", "guardar");
                    
//                     btnGuardar.textContent = "Procesando...";
//                     btnGuardar.disabled = true;

//                     // Enviar datos 
//                     const respuesta = await fetch("../dao/DAOcategoria.php", {
//                         method: "POST",
//                         body: datos
//                     });

//                     // Verificar respuesta HTTP
//                     if (!respuesta.ok) {
//                         throw new Error("Error HTTP: " + respuesta.status);
//                     }

//                     // Esperar a que DAO termine
//                     const resultado = await respuesta.json();
//                     if (resultado.estado) {
//                         // todo salio bien
//                         notificar("success", resultado.mensaje);

//                         limpiarCampos();

//                     } else {
//                         notificar("danger", resultado.mensaje);
//                     }
//                 } catch (error) {
//                     console.error("Error en la petición:", error);
//                 } finally {
//                     btnGuardar.disabled = false;
//                     btnGuardar.textContent = "Guardar";
//                 }
//             }
//         }

//         //////////////--------MODIFICAR------------------------///////////////////////////
//         if (btnGuardar.textContent.trim() == "Modificar") {

//             if (categoriaValido && margenValido) {
//                 try {
//                     const datos = new FormData(formulario);
//                     datos.append("opcion", "modificar");
//                     datos.append("id_categoria", btnGuardar.dataset.id_categoria);

//                     btnGuardar.disabled = true;
//                     btnGuardar.textContent = "Procesando...";

//                     // Enviar datos 
//                     // await hace que JavaScript ESPERE
//                     const respuesta = await fetch("../dao/DAOcategoria.php", {
//                         method: "POST",
//                         body: datos
//                     });

//                     // Verificar respuesta HTTP
//                     if (!respuesta.ok) {
//                         throw new Error("Error HTTP: " + respuesta.status);
//                     }

//                     // Esperar a que DAO termine
//                     const resultado = await respuesta.json();
//                     if (resultado.estado) {
//                         //todo salio bien
//                         Swal.fire({
//                             position: "top-end",
//                             icon: "success",
//                             title: "Poseidón",
//                             text: resultado.mensaje,
//                             showConfirmButton: false,
//                             timer: 1500
//                         }).then(() => {//cuando desaparece el mensaje se recarga la pagina
//                             window.location.href = "lista-categoria.php";
//                         });

//                     } else {
//                         Swal.fire({
//                             position: "top-end",
//                             icon: "danger",
//                             title: "Poseidón",
//                             text: resultado.mensaje,
//                             showConfirmButton: false,
//                             timer: 1500
//                         });
//                     }
//                 } catch (error) {

//                 } finally {
//                     btnGuardar.disabled = false;
//                     btnGuardar.textContent = "Guardar";
//                 }

//             }
//         }
//     });
// }

// //////////PROCESA AL TERMINAR DE CARGAR LA PAGINA
// document.addEventListener("DOMContentLoaded", async () => {
//     // Obtener el ID de la URL
//     const parametros = new URLSearchParams(window.location.search);
//     const id = parametros.get("id_categoria");

//     if (id) {//SI EXISTE EL ID, SE HACE LA BUSQUEDA
//         try {
//             const datos = new FormData();
//             datos.append("opcion", "consultarIndividual");
//             datos.append("id_categoria", id);

//             Swal.fire({
//                 title: "Consultando...",
//                 text: "Espere",
//                 allowOutsideClick: false,
//                 allowEscapeKey: false,
//                 didOpen: () => Swal.showLoading()
//             });

//             const respuesta = await fetch("../dao/DAOcategoria.php", {
//                 method: "POST",
//                 body: datos
//             });

//             if (!respuesta.ok) {
//                 console.error(respuesta.status);
//                 throw new Error("Error HTTP: " + respuesta.status);
//             }

//             const resultado = await respuesta.json();


//             // Cerrar el mensaje de espera
//             Swal.close();

//             if (resultado.estado) {
//                 categoria.value = resultado.datos.nombre;
//                 descripcion.value = resultado.datos.descripcion;
//                 margenGanancia.value = resultado.datos.margen_ganancia;
//                 estado.value = resultado.datos.estado;

//                 btnGuardar.textContent = "Modificar";
//                 btnGuardar.dataset.id_categoria = resultado.datos.id_categoria;
//             }

//         } catch (error) {
//             Swal.close();
//         }
//     }

// });

/* ============================================================
 * JScategoria.js
 * Formulario de categoría: guardar y modificar.
 * Usa notificar() de Notificaciones.js (no requiere SweetAlert).
 * ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const formulario = document.getElementById("formCategoria");
    if (!formulario) return;

    const nombre = document.getElementById("nombre");
    const descripcion = document.getElementById("descripcion");
    const margenGanancia = document.getElementById("margen_ganancia");
    const estado = document.getElementById("estado");
    const btnGuardar = document.getElementById("btnGuardar");
    const btnCancelar = document.getElementById("btnCancelar");
    const textoGuardar = document.getElementById("textoGuardar");
    const titulo = document.getElementById("tituloFormulario");

    const URL_LISTA = "lista-categoria.php";   // página de la lista
    const URL_DAO = "../dao/DAOcategoria.php";

    let idEdicion = null;   // null = registrando, número = modificando

    /* ---------------------- UTILIDADES ---------------------- */

    function marcar(campo, valido) {
        campo.classList.toggle("is-invalid", !valido);
        campo.classList.toggle("is-valid", valido);
        return valido;
    }

    function validarNombre() {
        return marcar(nombre, nombre.value.trim() !== "");
    }

    function validarMargen() {
        const valor = parseFloat(margenGanancia.value);
        let mensaje = "";

        if (margenGanancia.value.trim() === "" || isNaN(valor)) {
            mensaje = "El margen de ganancia es obligatorio y debe ser un número.";
        } else if (valor <= 0) {
            mensaje = "El margen de ganancia debe ser mayor que cero.";
        } else if (valor > 100) {
            mensaje = "El margen de ganancia no puede superar el 100%.";
        }

        marcar(margenGanancia, mensaje === "");
        return mensaje;   // "" si es válido
    }

    function limpiarCampos() {
        formulario.reset();
        [nombre, descripcion, margenGanancia].forEach((c) => c.classList.remove("is-invalid", "is-valid"));
        estado.value = "activo";
    }

    function modoEdicion(activo) {
        titulo.textContent = activo ? "Modificar Categoría" : "Registrar Nueva Categoría";
        textoGuardar.textContent = activo ? "Modificar Categoría" : "Guardar Categoría";
    }

    /* ---------------------- EVENTOS ---------------------- */

    // Nombre y descripción en mayúsculas
    [nombre, descripcion].forEach((campo) => {
        campo.addEventListener("input", () => {
            campo.value = campo.value.toUpperCase();
            if (campo === nombre) validarNombre();
        });
    });
    nombre.addEventListener("blur", validarNombre);
    margenGanancia.addEventListener("blur", validarMargen);

    btnCancelar.addEventListener("click", () => { window.location.href = URL_LISTA; });

    btnGuardar.addEventListener("click", async () => {
        const nombreValido = validarNombre();
        const errorMargen = validarMargen();

        if (!nombreValido) {
            notificar("danger", "El nombre de la categoría es obligatorio.");
            nombre.focus();
            return;
        }
        if (errorMargen) {
            notificar("danger", errorMargen);
            margenGanancia.focus();
            return;
        }

        const modificando = idEdicion !== null;
        const textoOriginal = textoGuardar.textContent;

        try {
            const datos = new FormData(formulario);
            datos.append("opcion", modificando ? "modificar" : "guardar");
            if (modificando) datos.append("id_categoria", idEdicion);

            btnGuardar.disabled = true;
            textoGuardar.textContent = "Procesando...";

            const respuesta = await fetch(URL_DAO, { method: "POST", body: datos });
            if (!respuesta.ok) {
                throw new Error("Error HTTP: " + respuesta.status);
            }
            const resultado = await respuesta.json();

            if (resultado.estado) {
                notificar("success", resultado.mensaje);
                if (modificando) {
                    // Vuelve a la lista cuando termina el aviso
                    setTimeout(() => { window.location.href = URL_LISTA; }, 1500);
                    return;
                }
                limpiarCampos();
            } else {
                notificar("danger", resultado.mensaje);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            notificar("danger", "No se pudo completar la operación");
        } finally {
            btnGuardar.disabled = false;
            textoGuardar.textContent = textoOriginal;
        }
    });

    /* ---------------------- CARGAR PARA MODIFICAR ---------------------- */

    // Acepta ?id=5 (como lo manda la lista) o ?id_categoria=5
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id") || parametros.get("id_categoria");

    if (id) {
        try {
            const datos = new FormData();
            datos.append("opcion", "consultarIndividual");
            datos.append("id_categoria", id);

            const respuesta = await fetch(URL_DAO, { method: "POST", body: datos });
            if (!respuesta.ok) {
                throw new Error("Error HTTP: " + respuesta.status);
            }
            const resultado = await respuesta.json();

            if (resultado.estado) {
                nombre.value = resultado.datos.nombre ?? "";
                descripcion.value = resultado.datos.descripcion ?? "";
                margenGanancia.value = resultado.datos.margen_ganancia ?? "";
                estado.value = String(resultado.datos.estado ?? "activo").toLowerCase();

                idEdicion = resultado.datos.id_categoria;
                modoEdicion(true);
            } else {
                notificar("danger", "La categoría no existe");
            }
        } catch (error) {
            console.error("Error al consultar la categoría:", error);
            notificar("danger", "No se pudo cargar la categoría");
        }
    }
});