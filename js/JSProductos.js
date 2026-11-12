const formulario = document.getElementById("formulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const nombre = document.getElementById("nombre");
const categoria = document.getElementById("id_categoria");
const material = document.getElementById("material");
const descripcion = document.getElementById("descripcion");
const alto = document.getElementById("alto_cm");
const ancho = document.getElementById("ancho_cm");
const profundidad = document.getElementById("profundidad_cm");
const pesoKg = document.getElementById("peso_kg");
const stockMinimo = document.getElementById("stock_minimo");
const precioVenta = document.getElementById("precio_venta");

const MAX_MEDIDA = 999.99;
const MAX_PRECIO = 9999.99;

let htmlBoton = btnGuardar ? btnGuardar.innerHTML : "";

function marcar(campo, valido) {
  campo.classList.toggle("is-invalid", !valido);
  campo.classList.toggle("is-valid", valido);
}

function sinMarca(campo) {
  campo.classList.remove("is-invalid", "is-valid");
}

function validarCampo(campo) {
  const valido = campo.value.trim() !== "";
  marcar(campo, valido);
  return valido;
}

function validarCategoria() {
  const valido = categoria.value !== "" && categoria.value !== "0";
  marcar(categoria, valido);
  return valido;
}

function validarDecimal(campo, obligatorio, maximo) {
  const texto = campo.value.trim();
  if (texto === "") {
    if (!obligatorio) {
      sinMarca(campo);
      return true;
    }
    marcar(campo, false);
    return false;
  }
  const valido = /^\d+(\.\d{1,2})?$/.test(texto) && Number(texto) <= maximo;
  marcar(campo, valido);
  return valido;
}

function validarEntero(campo) {
  const valido = /^\d{1,9}$/.test(campo.value.trim());
  marcar(campo, valido);
  return valido;
}

function soloNumeros(campo, conDecimales) {
  campo.addEventListener("keydown", function (e) {
    const bloqueadas = ["e", "E", "+", "-"];
    if (!conDecimales) bloqueadas.push(".", ",");
    if (bloqueadas.includes(e.key)) e.preventDefault();
  });

  if (conDecimales) {
    campo.addEventListener("input", function () {
      const valor = campo.value;
      const punto = valor.indexOf(".");
      if (punto !== -1 && valor.length - punto - 1 > 2) {
        campo.value = valor.substring(0, punto + 3);
      }
    });
  }
}

function limpiarCampos() {
  [nombre, material, descripcion, alto, ancho, profundidad, pesoKg].forEach(function (campo) {
    campo.value = "";
  });
  stockMinimo.value = "0";
  precioVenta.value = "0.00";
  categoria.value = "0";
  [nombre, categoria, material, descripcion, alto, ancho, profundidad, pesoKg, stockMinimo, precioVenta]
    .forEach(sinMarca);
  nombre.focus();
}

if (formulario) {
  nombre.addEventListener("input", function () {
    nombre.value = nombre.value.toUpperCase();
    validarCampo(nombre);
  });
  nombre.addEventListener("blur", () => validarCampo(nombre));
  categoria.addEventListener("change", validarCategoria);

  soloNumeros(alto, true);
  soloNumeros(ancho, true);
  soloNumeros(profundidad, true);
  soloNumeros(pesoKg, true);
  soloNumeros(precioVenta, true);
  soloNumeros(stockMinimo, false);

  alto.addEventListener("blur", () => validarDecimal(alto, false, MAX_MEDIDA));
  ancho.addEventListener("blur", () => validarDecimal(ancho, false, MAX_MEDIDA));
  profundidad.addEventListener("blur", () => validarDecimal(profundidad, false, MAX_MEDIDA));
  pesoKg.addEventListener("blur", () => validarDecimal(pesoKg, false, MAX_MEDIDA));
  precioVenta.addEventListener("blur", () => validarDecimal(precioVenta, true, MAX_PRECIO));
  stockMinimo.addEventListener("blur", () => validarEntero(stockMinimo));

  btnCancelar.addEventListener("click", function () {
    window.location.href = "Lista_Productos.php";
  });

  btnGuardar.addEventListener("click", async function () {
    const resultados = [
      validarCampo(nombre),
      validarCategoria(),
      validarDecimal(alto, false, MAX_MEDIDA),
      validarDecimal(ancho, false, MAX_MEDIDA),
      validarDecimal(profundidad, false, MAX_MEDIDA),
      validarDecimal(pesoKg, false, MAX_MEDIDA),
      validarEntero(stockMinimo),
      validarDecimal(precioVenta, true, MAX_PRECIO)
    ];

    if (!resultados.every(Boolean)) {
      notificar("warning", "Revise los campos marcados en rojo");
      return;
    }

    const idProducto = btnGuardar.dataset.id || "";
    const datos = new FormData(formulario);
    datos.append("opcion", idProducto ? "modificar" : "guardar");
    if (idProducto) datos.append("id_producto", idProducto);

    btnGuardar.disabled = true;
    btnGuardar.textContent = "Procesando...";

    try {
      const respuesta = await fetch("../dao/DAOProductos.php", {
        method: "POST",
        body: datos
      });

      if (!respuesta.ok) {
        throw new Error("Error HTTP: " + respuesta.status);
      }

      const resultado = await respuesta.json();
      if (resultado.estado) {
        notificar("success", resultado.mensaje);
        if (idProducto) {
          setTimeout(() => {
            window.location.href = "Lista_Productos.php";
          }, 1200);
        } else {
          limpiarCampos();
        }
      } else {
        notificar("danger", resultado.mensaje);
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      notificar("danger", "No se pudo guardar el producto");
    } finally {
      btnGuardar.disabled = false;
      btnGuardar.innerHTML = htmlBoton;
    }
  });
}

async function cargarCategorias() {
  const datos = new FormData();
  datos.append("opcion", "consultar");

  const respuesta = await fetch("../dao/DAOCateg.php", {
    method: "POST",
    body: datos
  });

  if (!respuesta.ok) {
    throw new Error("Error HTTP: " + respuesta.status);
  }

  const categorias = await respuesta.json();
  if (!Array.isArray(categorias)) {
    throw new Error(categorias.mensaje || "Respuesta no válida de DAOCateg.php");
  }

  categoria.innerHTML = '<option value="0">[SELECCIONE CATEGORÍA]</option>';
  categorias.forEach(function (c) {
    const opcion = document.createElement("option");
    opcion.value = c.id_categoria;
    opcion.textContent = c.nombre;
    categoria.appendChild(opcion);
  });

  if (categorias.length === 0) {
    notificar("warning", "No hay categorías registradas. Agregue al menos una antes de crear productos.");
  }
}

async function cargarProducto(idProducto) {
  const datos = new FormData();
  datos.append("opcion", "consultarIndividual");
  datos.append("id_producto", idProducto);

  const respuesta = await fetch("../dao/DAOProductos.php", {
    method: "POST",
    body: datos
  });

  if (!respuesta.ok) {
    throw new Error("Error HTTP: " + respuesta.status);
  }

  const resultado = await respuesta.json();
  if (!resultado.estado) {
    notificar("warning", "El producto no existe");
    return;
  }

  const d = resultado.datos;
  nombre.value = d.nombre ?? "";
  material.value = d.material ?? "";
  descripcion.value = d.descripcion ?? "";
  alto.value = d.alto ?? "";
  ancho.value = d.ancho ?? "";
  profundidad.value = d.profundidad ?? "";
  pesoKg.value = d.peso_kg ?? "";
  stockMinimo.value = d.stock_minimo ?? 0;
  precioVenta.value = d.precio_venta ?? "0.00";

  categoria.value = d.id_categoria;
  if (categoria.value !== String(d.id_categoria)) {
    categoria.add(new Option(d.categoria + " (inactiva)", d.id_categoria));
  }
  categoria.value = d.id_categoria;

  btnGuardar.dataset.id = d.id_producto;
  btnGuardar.innerHTML = '<i class="bi bi-save"></i> Modificar';
  htmlBoton = btnGuardar.innerHTML;

  if (tituloFormulario) tituloFormulario.textContent = "Modificar Producto";
  const miga = document.querySelector(".breadcrumb-item.active span");
  if (miga) miga.textContent = "Modificar Producto";

  if (d.estado === "inactivo") {
    notificar("info", "Este producto está dado de baja");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!formulario) return;

  try {
    await cargarCategorias();
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    notificar("danger", "No se pudieron cargar las categorías: " + error.message);
  }

  const idProducto = new URLSearchParams(window.location.search).get("id");
  if (idProducto) {
    try {
      await cargarProducto(idProducto);
    } catch (error) {
      console.error("Error al cargar el producto:", error);
      notificar("danger", "No se pudo cargar el producto");
    }
  }
});