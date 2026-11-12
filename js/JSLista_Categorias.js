/* ============================================================
 * JSLista_Categorias.js
 * Lista de categorías con diseño propio (sin librerías de tablas):
 * tarjetas de resumen, filtros, orden, paginación,
 * editar y dar de baja / reactivar (activo <-> inactivo).
 * ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
    const cuerpo = document.getElementById("cuerpo-tabla");
    if (!cuerpo) return;

    const tablaWrap = document.getElementById("tabla-wrap");
    const encabezados = document.querySelectorAll("#tabla-categorias th[data-orden]");
    const buscador = document.getElementById("table-filter");
    const chipsEstado = document.querySelectorAll(".lp-chip[data-estado]");
    const chkVacias = document.getElementById("solo-vacias");
    const btnFiltros = document.getElementById("btnFiltros");
    const panelFiltros = document.getElementById("panelFiltros");
    const btnLimpiar = document.getElementById("limpiar-filtros");
    const btnImprimir = document.getElementById("print-table");
    const selTam = document.getElementById("tam-pagina");
    const pager = document.getElementById("table-pagination");
    const contador = document.getElementById("total-registros");
    const vacio = document.getElementById("estado-vacio");

    // Estado de la pantalla
    let categorias = [];
    let cargando = true;
    let estado = "";          // "", "activo", "inactivo"
    let soloVacias = false;
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

    const cantidad = (c) => Number(c.total_productos ?? 0);

    /* ---------------------- FILTRADO Y ORDEN ---------------------- */

    function filtrar() {
        const q = texto.trim().toLowerCase();

        const lista = categorias.filter((c) => {
            if (estado && c.estado !== estado) return false;
            if (soloVacias && cantidad(c) > 0) return false;
            if (!q) return true;
            return [c.nombre, c.descripcion, c.estado]
                .some((v) => String(v ?? "").toLowerCase().includes(q));
        });

        const numerico = orden.campo === "total_productos";
        lista.sort((a, b) => {
            const x = numerico ? cantidad(a) : String(a[orden.campo] ?? "").toLowerCase();
            const y = numerico ? cantidad(b) : String(b[orden.campo] ?? "").toLowerCase();
            return (x < y ? -1 : x > y ? 1 : 0) * orden.dir;
        });
        return lista;
    }

    function hayFiltros() {
        return estado !== "" || soloVacias || texto.trim() !== "";
    }

    /* ---------------------- DIBUJO ---------------------- */

    function dibujarResumen() {
    const activas = categorias.filter((c) => c.estado === "activo");
    const poner = (id, valor) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    };
    poner("stat-total", categorias.length);
    poner("stat-activas", activas.length);
    poner("stat-inactivas", categorias.length - activas.length);
    poner("stat-productos", categorias.reduce((suma, c) => suma + cantidad(c), 0));
}

    function dibujarChips() {
        chipsEstado.forEach((c) => c.classList.toggle("activo", c.dataset.estado === estado));
        chkVacias.checked = soloVacias;
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

    function filaHTML(c) {
        const activo = c.estado === "activo";
        const total = cantidad(c);

        return `
        <tr class="${activo ? "" : "lp-baja"}" data-id="${esc(c.id_categoria)}">
            <td>
                <div class="lp-prod">
                    <span class="lp-prod-ico"><i class="bi bi-tag" aria-hidden="true"></i></span>
                    <span>
                        <div class="lp-prod-nom">${esc(c.nombre)}</div>
                        <div class="lp-prod-sub">ID: ${esc(c.id_categoria)}</div>
                    </span>
                </div>
            </td>
            <td class="lp-desc">${c.descripcion ? esc(c.descripcion) : '<span class="lp-prod-sub">Sin descripción</span>'}</td>
            <td class="lp-centro"><span class="lp-cat ${total ? "" : "cero"}">${total}</span></td>
            <td class="lp-centro">
                <span class="lp-pill ${activo ? "activo" : "inactivo"}">${activo ? "Activa" : "Inactiva"}</span>
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
            titulo.textContent = "Cargando categorías...";
            detalle.textContent = "Un momento por favor.";
            accion.hidden = true;
            return;
        }

        accion.hidden = false;
        if (hayDatos) {
            // Hay categorías, pero ninguna coincide con los filtros
            titulo.textContent = "Sin resultados";
            detalle.textContent = "Ninguna categoría coincide con los filtros aplicados.";
            accion.outerHTML = '<button type="button" id="vacio-accion" class="lp-btn"><i class="bi bi-x-circle"></i> Limpiar filtros</button>';
        } else {
            titulo.textContent = "No hay categorías para mostrar";
            detalle.textContent = "Aún no se han registrado categorías en el sistema. Puedes agregar una nueva categoría o ajustar tus filtros.";
            accion.outerHTML = '<a id="vacio-accion" href="Categorias.php" class="lp-btn"><i class="bi bi-plus-lg"></i> Registrar Categoría</a>';
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
        if (sinFilas) dibujarVacio(categorias.length > 0 && hayFiltros());

        contador.textContent = `Total de Registros: ${lista.length}`;
        dibujarEncabezados();
        dibujarChips();
        dibujarPaginador(totalPaginas);
    }

    /* ---------------------- EVENTOS DE FILTROS ---------------------- */

    function limpiarFiltros() {
        estado = "";
        soloVacias = false;
        texto = "";
        buscador.value = "";
        pagina = 1;
        dibujar();
    }

    chipsEstado.forEach((chip) => chip.addEventListener("click", () => {
        estado = chip.dataset.estado;
        pagina = 1;
        dibujar();
    }));

    chkVacias.addEventListener("change", () => { soloVacias = chkVacias.checked; pagina = 1; dibujar(); });
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
            estado = atajo === "todos" ? "" : atajo;   // "activo" o "inactivo"
            soloVacias = false;
            texto = "";
            buscador.value = "";
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
        const categoria = categorias.find((c) => String(c.id_categoria) === fila.dataset.id);
        if (!categoria) return;

        if (e.target.closest(".btn-editar")) {
            location.href = "categoria.php?id=" + categoria.id_categoria;
        }
        if (e.target.closest(".btn-estado")) {
            cambiarEstado(categoria);
        }
    });

    /* ---------------------- DAR DE BAJA / REACTIVAR ---------------------- */

    async function cambiarEstado(categoria) {
        const nuevoEstado = categoria.estado === "activo" ? "inactivo" : "activo";
        const mensaje = nuevoEstado === "inactivo"
            ? `¿Confirma dar de baja la categoría "${categoria.nombre}"?`
            : `¿Confirma reactivar la categoría "${categoria.nombre}"?`;

        const confirmado = await confirmarAccion(
            mensaje,
            nuevoEstado === "inactivo" ? "Sí, dar de baja" : "Sí, reactivar",
            nuevoEstado === "inactivo" ? "danger" : "success"
        );
        if (!confirmado) return;

        try {
            const datos = new FormData();
            datos.append("opcion", "cambiarEstado");
            datos.append("id_categoria", categoria.id_categoria);
            datos.append("estado", nuevoEstado);

            const respuesta = await fetch("../dao/DAOcategoria.php", {
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

    /* ---------------------- CARGA DE DATOS ---------------------- */

    async function cargarDatos() {
        cargando = true;
        dibujar();
        try {
            const datos = new FormData();
            datos.append("opcion", "consultar");
            const respuesta = await fetch("../dao/DAOcategoria.php", {
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
            categorias = resultado.map((c) => ({ ...c, estado: String(c.estado).toLowerCase() }));
            cargando = false;
            dibujarResumen();
            dibujar();
        } catch (error) {
            console.error("Error al cargar registros:", error);
            categorias = [];
            cargando = false;
            dibujarResumen();
            dibujar();
            notificar("danger", "No se pudieron cargar los registros");
        }
    }

    await cargarDatos();
});