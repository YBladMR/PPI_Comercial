/* ============================================================
 * JSLista_Productos.js
 * Lista de productos con diseño propio (sin librerías de tablas):
 * tarjetas de resumen, filtros, orden, paginación,
 * editar y dar de baja / reactivar (activo <-> inactivo).
 * ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const cuerpo = document.getElementById("cuerpo-tabla");
    if (!cuerpo) return;

    const tablaWrap = document.getElementById("tabla-wrap");
    const encabezados = document.querySelectorAll("#tabla-productos th[data-orden]");
    const buscador = document.getElementById("table-filter");
    const chipsEstado = document.querySelectorAll(".lp-chip[data-estado]");
    const selCategoria = document.getElementById("filtro-categoria");
    const chkBajo = document.getElementById("solo-bajo");
    const btnFiltros = document.getElementById("btnFiltros");
    const panelFiltros = document.getElementById("panelFiltros");
    const btnLimpiar = document.getElementById("limpiar-filtros");
    const btnImprimir = document.getElementById("print-table");
    const selTam = document.getElementById("tam-pagina");
    const pager = document.getElementById("table-pagination");
    const contador = document.getElementById("total-registros");
    const vacio = document.getElementById("estado-vacio");

    // Estado de la pantalla
    let productos = [];
    let cargando = true;
    let estado = "";          // "", "activo", "inactivo"
    let categoria = "";       // nombre de la categoría o ""
    let soloBajo = false;
    let texto = "";
    let orden = { campo: "nombre", dir: 1 };
    let pagina = 1;
    let tam = Number(selTam.value);

    /* ---------------------- UTILIDADES ---------------------- */

    // Evita que un nombre con < > " se interprete como HTML
    function esc(valor) {
        return String(valor ?? "").replace(/[&<>"']/g, (c) => (
            { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
        ));
    }

    const esBajo = (p) => Number(p.existencia) <= Number(p.stock_minimo);

    function textoDimensiones(p) {
        if (p.alto === null && p.ancho === null && p.profundidad === null) return "-";
        const valor = (v) => (v === null ? "-" : String(Number(v)));
        return `${valor(p.alto)} x ${valor(p.ancho)} x ${valor(p.profundidad)}`;
    }

    /* ---------------------- FILTRADO Y ORDEN ---------------------- */

    function filtrar() {
        const q = texto.trim().toLowerCase();

        const lista = productos.filter((p) => {
            if (estado && p.estado !== estado) return false;
            if (categoria && p.categoria !== categoria) return false;
            if (soloBajo && !(p.estado === "activo" && esBajo(p))) return false;
            if (!q) return true;
            return [p.nombre, p.categoria, p.material, p.dimensiones, p.estado]
                .some((v) => String(v ?? "").toLowerCase().includes(q));
        });

        const numerico = ["existencia", "precio_venta"].includes(orden.campo);
        lista.sort((a, b) => {
            const x = numerico ? Number(a[orden.campo]) : String(a[orden.campo] ?? "").toLowerCase();
            const y = numerico ? Number(b[orden.campo]) : String(b[orden.campo] ?? "").toLowerCase();
            return (x < y ? -1 : x > y ? 1 : 0) * orden.dir;
        });
        return lista;
    }

    function hayFiltros() {
        return estado !== "" || categoria !== "" || soloBajo || texto.trim() !== "";
    }

    /* ---------------------- DIBUJO ---------------------- */

    function dibujarResumen() {
        const activos = productos.filter((p) => p.estado === "activo");
        document.getElementById("stat-total").textContent = productos.length;
        document.getElementById("stat-activos").textContent = activos.length;
        document.getElementById("stat-bajo").textContent = activos.filter(esBajo).length;
        document.getElementById("stat-categorias").textContent = new Set(productos.map((p) => p.categoria)).size;
    }

    // El select "Por categoría" se arma con las categorías que tienen productos
    function dibujarCategorias() {
        const nombres = [...new Set(productos.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b, "es"));
        selCategoria.innerHTML = '<option value="">Por categoría</option>' +
            nombres.map((n) => `<option value="${esc(n)}">${esc(n)}</option>`).join("");
        selCategoria.value = nombres.includes(categoria) ? categoria : "";
        categoria = selCategoria.value;
    }

    function dibujarChips() {
        chipsEstado.forEach((c) => c.classList.toggle("activo", c.dataset.estado === estado));
        selCategoria.classList.toggle("activo", categoria !== "");
        chkBajo.checked = soloBajo;
    }

    function dibujarEncabezados() {
        encabezados.forEach((th) => {
            th.querySelector(".bi")?.remove();
            if (th.dataset.orden === orden.campo) {
                th.insertAdjacentHTML("beforeend",
                    `<i class="bi ${orden.dir === 1 ? "bi-caret-up-fill" : "bi-caret-down-fill"}" aria-hidden="true"></i>`);
            }
        });
    }

    function filaHTML(p) {
        const activo = p.estado === "activo";
        const bajo = esBajo(p);

        return `
        <tr class="${activo ? "" : "lp-baja"}" data-id="${esc(p.id_producto)}">
            <td>
                <div class="lp-prod">
                    <span class="lp-prod-ico"><i class="bi bi-box-seam" aria-hidden="true"></i></span>
                    <span>
                        <div class="lp-prod-nom">${esc(p.nombre)}</div>
                        <div class="lp-prod-sub">${p.material ? esc(p.material) : "Sin material"}</div>
                    </span>
                </div>
            </td>
            <td><span class="lp-cat">${esc(p.categoria)}</span></td>
            <td>${esc(p.dimensiones)}</td>
            <td class="lp-der">
                <span class="lp-stock-num ${bajo ? "bajo" : ""}">${Number(p.existencia)}</span>
                <div class="lp-prod-sub">mín. ${Number(p.stock_minimo)}</div>
            </td>
            <td class="lp-der">$${Number(p.precio_venta ?? 0).toFixed(2)}</td>
            <td class="lp-centro">
                <span class="lp-pill ${activo ? "activo" : "inactivo"}">${activo ? "Activo" : "Inactivo"}</span>
            </td>
            <td class="lp-centro lp-col-acc">
                <span class="lp-acc">
                    <button type="button" class="lp-ib btn-editar" title="Editar" aria-label="Editar">
                        <i class="bi bi-pencil" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="lp-ib btn-estado ${activo ? "baja" : "alta"}"
                            title="${activo ? "Dar de baja" : "Reactivar"}" aria-label="${activo ? "Dar de baja" : "Reactivar"}">
                        <i class="bi ${activo ? "bi-slash-circle" : "bi-arrow-counterclockwise"}" aria-hidden="true"></i>
                    </button>
                </span>
            </td>
        </tr>`;
    }

    function dibujarVacio(hayDatos) {
        const titulo = document.getElementById("vacio-titulo");
        const detalle = document.getElementById("vacio-texto");
        const accion = document.getElementById("vacio-accion");

        if (cargando) {
            titulo.textContent = "Cargando productos...";
            detalle.textContent = "Un momento por favor.";
            accion.hidden = true;
            return;
        }

        accion.hidden = false;
        if (hayDatos) {
            // Hay productos, pero ninguno coincide con los filtros
            titulo.textContent = "Sin resultados";
            detalle.textContent = "Ningún producto coincide con los filtros aplicados.";
            accion.outerHTML = '<button type="button" id="vacio-accion" class="lp-btn"><i class="bi bi-x-circle"></i> Limpiar filtros</button>';
        } else {
            titulo.textContent = "No hay productos para mostrar";
            detalle.textContent = "Aún no se han registrado productos en el sistema. Puedes agregar un nuevo producto o ajustar tus filtros.";
            accion.outerHTML = '<a id="vacio-accion" href="Productos.php" class="lp-btn"><i class="bi bi-plus-lg"></i> Registrar Producto</a>';
        }
    }

    function dibujarPaginador(totalPaginas) {
        const boton = (txt, ir, extra = "", deshabilitado = false) =>
            `<button type="button" data-ir="${ir}" class="${extra}" ${deshabilitado ? "disabled" : ""}>${txt}</button>`;

        let html = boton('<i class="bi bi-chevron-left"></i>', pagina - 1, "", pagina <= 1);

        // Primera, última y las páginas cercanas a la actual
        const visibles = [];
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || Math.abs(i - pagina) <= 1) visibles.push(i);
        }
        let anterior = 0;
        visibles.forEach((i) => {
            if (i - anterior > 1) html += '<button type="button" disabled>…</button>';
            html += boton(i, i, i === pagina ? "activo" : "");
            anterior = i;
        });

        html += boton('<i class="bi bi-chevron-right"></i>', pagina + 1, "", pagina >= totalPaginas);
        pager.innerHTML = html;
    }

    function dibujar() {
        const lista = filtrar();
        const totalPaginas = Math.max(1, Math.ceil(lista.length / tam));
        if (pagina > totalPaginas) pagina = totalPaginas;

        const visibles = lista.slice((pagina - 1) * tam, pagina * tam);
        cuerpo.innerHTML = visibles.map(filaHTML).join("");

        const sinFilas = visibles.length === 0;
        tablaWrap.hidden = sinFilas;
        vacio.hidden = !sinFilas;
        if (sinFilas) dibujarVacio(productos.length > 0 && hayFiltros());

        contador.textContent = `Total de Registros: ${lista.length}`;
        dibujarEncabezados();
        dibujarChips();
        dibujarPaginador(totalPaginas);
    }

    /* ---------------------- EVENTOS DE FILTROS ---------------------- */

    function limpiarFiltros() {
        estado = "";
        categoria = "";
        soloBajo = false;
        texto = "";
        buscador.value = "";
        selCategoria.value = "";
        pagina = 1;
        dibujar();
    }

    chipsEstado.forEach((chip) => chip.addEventListener("click", () => {
        estado = chip.dataset.estado;
        pagina = 1;
        dibujar();
    }));

    selCategoria.addEventListener("change", () => { categoria = selCategoria.value; pagina = 1; dibujar(); });
    chkBajo.addEventListener("change", () => { soloBajo = chkBajo.checked; pagina = 1; dibujar(); });
    buscador.addEventListener("input", () => { texto = buscador.value; pagina = 1; dibujar(); });
    selTam.addEventListener("change", () => { tam = Number(selTam.value); pagina = 1; dibujar(); });
    btnLimpiar.addEventListener("click", () => { limpiarFiltros(); cerrarFiltros(); });

    // El botón del estado vacío cambia según el caso, por eso se escucha en el contenedor
    vacio.addEventListener("click", (e) => {
        if (e.target.closest("button#vacio-accion")) limpiarFiltros();
    });

    // Las tarjetas de resumen funcionan como atajos de filtro
    document.querySelectorAll(".lp-stat[data-atajo]").forEach((tarjeta) => {
        tarjeta.addEventListener("click", () => {
            const atajo = tarjeta.dataset.atajo;
            estado = atajo === "activo" ? "activo" : "";
            categoria = "";
            soloBajo = atajo === "bajo";
            texto = "";
            buscador.value = "";
            selCategoria.value = "";
            pagina = 1;
            dibujar();
        });
    });

    encabezados.forEach((th) => th.addEventListener("click", () => {
        const campo = th.dataset.orden;
        orden = { campo, dir: orden.campo === campo ? -orden.dir : 1 };
        pagina = 1;
        dibujar();
    }));

    pager.addEventListener("click", (e) => {
        const b = e.target.closest("button[data-ir]");
        if (!b || b.disabled) return;
        pagina = Number(b.dataset.ir);
        dibujar();
    });

    // Menú "Filtros"
    function cerrarFiltros() {
        panelFiltros.hidden = true;
        btnFiltros.setAttribute("aria-expanded", "false");
    }
    btnFiltros.addEventListener("click", (e) => {
        e.stopPropagation();
        panelFiltros.hidden = !panelFiltros.hidden;
        btnFiltros.setAttribute("aria-expanded", String(!panelFiltros.hidden));
    });
    panelFiltros.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", cerrarFiltros);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarFiltros(); });

    btnImprimir.addEventListener("click", () => {
        cerrarFiltros();
        window.print();
    });

    /* ---------------------- ACCIONES DE LA FILA ---------------------- */

    cuerpo.addEventListener("click", (e) => {
        const fila = e.target.closest("tr[data-id]");
        if (!fila) return;
        const producto = productos.find((p) => String(p.id_producto) === fila.dataset.id);
        if (!producto) return;

        if (e.target.closest(".btn-editar")) {
            location.href = "Productos.php?id=" + producto.id_producto;
        }
        if (e.target.closest(".btn-estado")) {
            cambiarEstado(producto);
        }
    });

    /* ---------------------- DAR DE BAJA / REACTIVAR ---------------------- */

    async function cambiarEstado(producto) {
        const nuevoEstado = producto.estado === "activo" ? "inactivo" : "activo";

        const confirmacion = await Swal.fire({
            title: "ComercialX",
            text: nuevoEstado === "inactivo"
                ? `¿Confirma dar de baja el producto "${producto.nombre}"?`
                : `¿Confirma reactivar el producto "${producto.nombre}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, confirmo",
            cancelButtonText: "Cancelar"
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const datos = new FormData();
            datos.append("opcion", "cambiarEstado");
            datos.append("id_producto", producto.id_producto);
            datos.append("estado", nuevoEstado);

            const respuesta = await fetch("../dao/DAOProductos.php", {
                method: "POST",
                body: datos
            });

            if (!respuesta.ok) {
                throw new Error("Error HTTP: " + respuesta.status);
            }

            const resultado = await respuesta.json();

            if (resultado.estado) {
                await Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "ComercialX",
                    text: resultado.mensaje,
                    showConfirmButton: false,
                    timer: 1500
                });
                await cargarDatos();
            } else {
                Swal.fire({ icon: "error", title: "ComercialX", text: resultado.mensaje });
            }
        } catch (error) {
            console.error("Error al cambiar el estado:", error);
            Swal.fire({ icon: "error", title: "ComercialX", text: "No se pudo cambiar el estado" });
        }
    }

    /* ---------------------- CARGA DE DATOS ---------------------- */

    async function cambiarEstado(producto) {
    const nuevoEstado = producto.estado === "activo" ? "inactivo" : "activo";
    const mensaje = nuevoEstado === "inactivo"
        ? `¿Confirma dar de baja el producto "${producto.nombre}"?`
        : `¿Confirma reactivar el producto "${producto.nombre}"?`;

    const confirmado = await confirmarAccion(
        mensaje,
        nuevoEstado === "inactivo" ? "Sí, dar de baja" : "Sí, reactivar",
        nuevoEstado === "inactivo" ? "danger" : "success"
    );
    if (!confirmado) return;

    try {
        const datos = new FormData();
        datos.append("opcion", "cambiarEstado");
        datos.append("id_producto", producto.id_producto);
        datos.append("estado", nuevoEstado);

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
        await cargarDatos();
        } else {
        notificar("danger", resultado.mensaje);
        }
    } catch (error) {
        console.error("Error al cambiar el estado:", error);
        notificar("danger", "No se pudo cambiar el estado");
    }
    }

    async function cargarDatos() {
    cargando = true;
    dibujar();
    try {
        const datos = new FormData();
        datos.append("opcion", "consultar");
        const respuesta = await fetch("../dao/DAOProductos.php", {
        method: "POST",
        body: datos
        });
        if (!respuesta.ok) {
        throw new Error("Error HTTP: " + respuesta.status);
        }
        const resultado = await respuesta.json();
        if (!Array.isArray(resultado)) {
        throw new Error(resultado.mensaje || "Respuesta no válida");
        }
        productos = resultado.map((p) => ({ ...p, dimensiones: textoDimensiones(p) }));
        cargando = false;
        dibujarResumen();
        dibujarCategorias();
        dibujar();
    } catch (error) {
        console.error("Error al cargar registros:", error);
        productos = [];
        cargando = false;
        dibujarResumen();
        dibujarCategorias();
        dibujar();
        notificar("danger", "No se pudieron cargar los registros");
    }
    }

    await cargarDatos();
});