function asegurarContenedorToasts() {
  let contenedor = document.getElementById("contenedor-toasts");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "contenedor-toasts";
    contenedor.className = "toast-container position-fixed top-0 end-0 p-3";
    contenedor.style.zIndex = "1090";
    document.body.appendChild(contenedor);
  }
  return contenedor;
}

function asegurarModalConfirmacion() {
  let modalEl = document.getElementById("modalConfirmarCoreUI");
  if (!modalEl) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="modal fade" id="modalConfirmarCoreUI" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header">
              <h5 class="modal-title d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill text-warning"></i> Confirmar acción
              </h5>
              <button type="button" class="btn-close" id="btnModalCerrarX" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="modalConfirmarTexto"></div>
            <div class="modal-footer bg-body-tertiary">
              <button type="button" class="btn btn-secondary" id="btnModalCancelar">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btnModalAceptar">Confirmar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    modalEl = wrapper.firstElementChild;
    document.body.appendChild(modalEl);
  }
  return modalEl;
}

/**
 * Notificación flotante nativa de CoreUI
 */
function notificar(tipo, mensaje) {
  const contenedor = asegurarContenedorToasts();

  const iconos = {
    success: "bi-check-circle-fill",
    danger: "bi-x-octagon-fill",
    warning: "bi-exclamation-triangle-fill",
    info: "bi-info-circle-fill"
  };

  const titulos = {
    success: "Éxito",
    danger: "Error",
    warning: "Atención",
    info: "Información"
  };

  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${tipo} border-0 shadow mb-2`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${iconos[tipo] || iconos.info} fs-5"></i>
        <div>
          <strong class="d-block">${titulos[tipo] || "Comercial X"}</strong>
          <span>${mensaje}</span>
        </div>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Cerrar"></button>
    </div>
  `;

  contenedor.appendChild(toastEl);

  const btnCerrar = toastEl.querySelector(".btn-close");
  const quitarToast = () => toastEl.remove();
  btnCerrar.addEventListener("click", quitarToast);

  if (typeof coreui !== "undefined" && coreui.Toast) {
    const toast = new coreui.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener("hidden.coreui.toast", quitarToast);
  } else {
    // Respaldo visual por si coreui.bundle no cargó en la página
    toastEl.classList.add("show");
    setTimeout(quitarToast, 3500);
  }
}

/**
 * Modal de confirmación nativo de CoreUI (devuelve true o false)
 */
function confirmarAccion(mensaje, textoBoton = "Sí, confirmar", colorBoton = "danger") {
  return new Promise((resolve) => {
    const modalEl = asegurarModalConfirmacion();
    const textoEl = modalEl.querySelector("#modalConfirmarTexto");
    const btnAceptar = modalEl.querySelector("#btnModalAceptar");
    const btnCancelar = modalEl.querySelector("#btnModalCancelar");
    const btnCerrarX = modalEl.querySelector("#btnModalCerrarX");

    textoEl.textContent = mensaje;
    btnAceptar.textContent = textoBoton;
    btnAceptar.className = `btn btn-${colorBoton}`;

    const usarCoreUI = typeof coreui !== "undefined" && coreui.Modal;
    const modal = usarCoreUI ? coreui.Modal.getOrCreateInstance(modalEl) : null;
    let resuelto = false;

    const cerrar = (resultado) => {
      if (resuelto) return;
      resuelto = true;

      btnAceptar.removeEventListener("click", onAceptar);
      btnCancelar.removeEventListener("click", onCancelar);
      btnCerrarX.removeEventListener("click", onCancelar);

      if (usarCoreUI && modal) {
        modal.hide();
      } else {
        modalEl.classList.remove("show");
        modalEl.style.display = "none";
        document.getElementById("backdrop-confirm-fallback")?.remove();
      }
      resolve(resultado);
    };

    const onAceptar = () => cerrar(true);
    const onCancelar = () => cerrar(false);

    btnAceptar.addEventListener("click", onAceptar);
    btnCancelar.addEventListener("click", onCancelar);
    btnCerrarX.addEventListener("click", onCancelar);

    if (usarCoreUI && modal) {
      modalEl.addEventListener("hidden.coreui.modal", () => cerrar(false), { once: true });
      modal.show();
    } else {
      // Respaldo visual nativo si coreui.Modal no está disponible
      const backdrop = document.createElement("div");
      backdrop.id = "backdrop-confirm-fallback";
      backdrop.className = "modal-backdrop fade show";
      document.body.appendChild(backdrop);
      modalEl.style.display = "block";
      modalEl.classList.add("show");
    }
  });
}