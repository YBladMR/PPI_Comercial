<?php $titulo_pagina = "Registrar Producto"; ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Producto - Comercial X</title>
  <link rel="stylesheet" href="/project_comercial_ppi/vendors/simplebar/css/simplebar.css">
  <link rel="stylesheet" href="/project_comercial_ppi/css/vendors/simplebar.css">
  <link rel="stylesheet" href="/project_comercial_ppi/css/style.css">
  <script src="/project_comercial_ppi/js/config.js"></script>
  <script src="/project_comercial_ppi/js/color-modes.js"></script>

  <!-- Iconos y SweetAlert2 para las alertas -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.min.css" crossorigin="anonymous">
  
</head>
<body>

  <?php include '../Barra_Lateral.php'; ?>

    <div class="body flex-grow-1 px-3">
      <div class="container-lg">
        <div class="card mb-4">
          <div class="card-header fw-bold" id="tituloFormulario">
            Registrar Nuevo Producto
          </div>
          
          <div class="card-body">
            <!-- id="formulario" sin action ni method para que lo controle JSProductos.js -->
            <form id="formulario" novalidate>
              
              <!-- Fila 1: Nombre y Categoría -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label for="nombre" class="form-label">Nombre del Producto *</label>
                  <input type="text" class="form-control" id="nombre" name="nombre" maxlength="120" required placeholder="Ej. Computadora de Escritorio" autocomplete="off">
                </div>
                
                <div class="col-md-6">
                  <label for="id_categoria" class="form-label">Categoría *</label>
                  <select class="form-select" id="id_categoria" name="id_categoria" required>
                    <option value="0">[SELECCIONE CATEGORÍA]</option>
                  </select>
                </div>
              </div>

              <!-- Fila 2: Descripción -->
              <div class="row mb-3">
                <div class="col-md-12">
                  <label for="descripcion" class="form-label">Descripción</label>
                  <textarea class="form-control" id="descripcion" name="descripcion" rows="2" maxlength="255" placeholder="Especificaciones principales..."></textarea>
                </div>
              </div>

              <!-- Fila 3: Dimensiones -->
              <div class="row mb-3">
                <div class="col-md-4">
                  <label for="alto_cm" class="form-label">Alto (cm)</label>
                  <input type="number" step="0.01" min="0" class="form-control" id="alto_cm" name="alto_cm" placeholder="0.00" autocomplete="off">
                </div>
                <div class="col-md-4">
                  <label for="ancho_cm" class="form-label">Ancho (cm)</label>
                  <input type="number" step="0.01" min="0" class="form-control" id="ancho_cm" name="ancho_cm" placeholder="0.00" autocomplete="off">
                </div>
                <div class="col-md-4">
                  <label for="profundidad_cm" class="form-label">Profundidad (cm)</label>
                  <input type="number" step="0.01" min="0" class="form-control" id="profundidad_cm" name="profundidad_cm" placeholder="0.00" autocomplete="off">
                </div>
              </div>

              <!-- Fila 4: Peso, Material, Precio de Venta y Stock Mínimo -->
              <div class="row mb-3">
                <div class="col-md-3">
                  <label for="peso_kg" class="form-label">Peso (Kg)</label>
                  <input type="number" step="0.01" min="0" class="form-control" id="peso_kg" name="peso_kg" placeholder="0.00" autocomplete="off">
                </div>
                <div class="col-md-3">
                  <label for="material" class="form-label">Material</label>
                  <input type="text" class="form-control" id="material" name="material" maxlength="50" placeholder="Ej. Plástico / Aluminio" autocomplete="off">
                </div>
                <div class="col-md-3">
                  <label for="precio_venta" class="form-label">Precio de Venta ($) *</label>
                  <input type="number" step="0.01" min="0" class="form-control" id="precio_venta" name="precio_venta" value="0.00" required autocomplete="off">
                </div>
                <div class="col-md-3">
                  <label for="stock_minimo" class="form-label">Stock Mínimo *</label>
                  <input type="number" min="0" class="form-control" id="stock_minimo" name="stock_minimo" value="0" required autocomplete="off">
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" id="btnCancelar" class="btn btn-secondary">Cancelar</button>
                <button type="button" id="btnGuardar" class="btn btn-primary">
                  <i class="bi bi-save"></i> Guardar Producto
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
  <script src="../js/JSProductos.js?v=<?php echo filemtime('../js/JSProductos.js'); ?>"></script>
</body>
</html>