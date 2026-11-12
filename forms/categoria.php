<?php $titulo_pagina = "Registrar Categoría"; ?>
<!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Categoría - Comercial X</title>
  <link rel="stylesheet" href="/project_comercial_ppi/vendors/simplebar/css/simplebar.css">
  <link rel="stylesheet" href="/project_comercial_ppi/css/vendors/simplebar.css">
  <link rel="stylesheet" href="/project_comercial_ppi/css/style.css">
  <script src="/project_comercial_ppi/js/config.js"></script>
  <script src="/project_comercial_ppi/js/color-modes.js"></script>

  <!-- Iconos -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" crossorigin="anonymous">

  <!--
    OJO: aquí NO se carga Bootstrap desde CDN. CoreUI ya trae sus propios estilos y
    cambia de tema con data-coreui-theme. El CSS de Bootstrap 5.3 usa data-bs-theme y
    pisaba los colores de CoreUI, por eso el tema no cambiaba.
  -->
</head>

<body>

  <?php include '../Barra_Lateral.php'; ?>

  <div class="body flex-grow-1 px-3">
    <div class="container-lg">
      <div class="card mb-4">
        <div class="card-header fw-bold" id="tituloFormulario">
          Registrar Nueva Categoría
        </div>

        <div class="card-body">
          <form id="formCategoria" novalidate>

            <!-- Fila 1: Nombre y Margen de ganancia -->
            <div class="row mb-3">
              <div class="col-md-6">
                <label for="nombre" class="form-label">Nombre de la Categoría *</label>
                <input type="text" class="form-control" id="nombre" name="nombre" maxlength="100" required placeholder="Ej. Muebles de Oficina">
              </div>

              <div class="col-md-3">
                <label for="margen_ganancia" class="form-label">Margen de Ganancia (%) *</label>
                <div class="input-group">
                  <input type="number" step="0.01" min="0" max="100" class="form-control" id="margen_ganancia" name="margen_ganancia" required placeholder="Ej. 15.50">
                  <span class="input-group-text">%</span>
                </div>
              </div>

              <div class="col-md-3">
                <label for="estado" class="form-label">Estado *</label>
                <select class="form-select" id="estado" name="estado" required>
                  <option value="activo" selected>Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <!-- Fila 2: Descripción -->
            <div class="row mb-3">
              <div class="col-md-12">
                <label for="descripcion" class="form-label">Descripción</label>
                <textarea class="form-control" id="descripcion" name="descripcion" rows="2" maxlength="255" placeholder="Descripción breve de la categoría..."></textarea>
                <div class="form-text">El margen de ganancia se aplica al costo base de los productos de esta categoría.</div>
              </div>
            </div>

            <div class="d-flex justify-content-end gap-2">
              <button type="button" id="btnCancelar" class="btn btn-secondary">Cancelar</button>
              <button type="button" id="btnGuardar" class="btn btn-primary">
                <i class="bi bi-save"></i> <span id="textoGuardar">Guardar Categoría</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>

  <footer class="footer px-4">
    <div>Comercial X &copy; 2026.</div>
  </footer>

  </div> <!-- Cierra el wrapper de la Barra_Lateral.php -->

  <script src="/project_comercial_ppi/vendors/@coreui/coreui/js/coreui.bundle.min.js"></script>
  <script src="/project_comercial_ppi/vendors/simplebar/js/simplebar.min.js"></script>
  <script src="/project_comercial_ppi/js/Notificaciones.js?v=<?php echo filemtime('../js/Notificaciones.js'); ?>"></script>
  <script src="/project_comercial_ppi/js/JScategoria.js?v=<?php echo filemtime('../js/JScategoria.js'); ?>"></script>
</body>

</html> 