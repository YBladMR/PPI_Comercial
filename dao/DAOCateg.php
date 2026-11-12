<?php
header('Content-Type: application/json; charset=utf-8');
$opcion = $_POST['opcion'] ?? $_GET['opcion'] ?? '';

if ($opcion == "consultar") {
    require_once "../conexion.php";
    $sql = "SELECT id_categoria, nombre FROM categoria WHERE estado = 'activo' ORDER BY nombre";
    $resultado = $conexion->query($sql);

    $categorias = [];
    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $categorias[] = [
                'id_categoria' => $fila['id_categoria'],
                'nombre'       => $fila['nombre']
            ];
        }
        $resultado->free();
    }
    echo json_encode($categorias, JSON_UNESCAPED_UNICODE);
    $conexion->close();
}