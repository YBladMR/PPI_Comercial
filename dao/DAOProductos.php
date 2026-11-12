<?php
header('Content-Type: application/json; charset=utf-8');

$idproducto  = $_POST['id_producto'] ?? '';
$nombre      = trim($_POST['nombre'] ?? '');
$idcategoria = $_POST['id_categoria'] ?? '';
$estado      = $_POST['estado'] ?? '';

$stockminimo = vacioANulo($_POST['stock_minimo'] ?? '') ?? '0';
$precio      = vacioANulo($_POST['precio_venta'] ?? '') ?? '0';

$descripcion = vacioANulo($_POST['descripcion'] ?? '');
$material    = vacioANulo($_POST['material'] ?? '');
$alto        = vacioANulo($_POST['alto_cm'] ?? '');
$ancho       = vacioANulo($_POST['ancho_cm'] ?? '');
$profundidad = vacioANulo($_POST['profundidad_cm'] ?? '');
$peso        = vacioANulo($_POST['peso_kg'] ?? '');

$opcion = $_POST['opcion'] ?? $_GET['opcion'] ?? '';

if ($opcion == "guardar") {
    $error = validarProducto($nombre, $idcategoria, $descripcion, $material, $alto, $ancho, $profundidad, $peso, $precio, $stockminimo);
    if ($error !== null) {
        echo json_encode(["estado" => false, "mensaje" => $error], JSON_UNESCAPED_UNICODE);
        exit;
    }

    require_once "../conexion.php";

    if (productoDuplicado($conexion, $nombre, $idcategoria, 0)) {
        echo json_encode([
            "estado"  => false,
            "mensaje" => "Ya existe un producto con ese nombre en la categoría seleccionada"
        ], JSON_UNESCAPED_UNICODE);
        $conexion->close();
        exit;
    }

    $sql = "INSERT INTO producto (nombre, descripcion, id_categoria, alto_cm, ancho_cm, profundidad_cm, peso_kg, material, precio_venta, stock_minimo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssissssssi", $nombre, $descripcion, $idcategoria, $alto, $ancho, $profundidad, $peso, $material, $precio, $stockminimo);

    if ($stmt->execute()) {
        echo json_encode([
            "estado"  => true,
            "mensaje" => "Datos Guardados Correctamente"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "estado"  => false,
            "mensaje" => "Error al guardar los datos"
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    $conexion->close();
}

if ($opcion == "modificar") {
    if (!ctype_digit((string) $idproducto) || (int) $idproducto <= 0) {
        echo json_encode(["estado" => false, "mensaje" => "Producto no válido"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $error = validarProducto($nombre, $idcategoria, $descripcion, $material, $alto, $ancho, $profundidad, $peso, $precio, $stockminimo);
    if ($error !== null) {
        echo json_encode(["estado" => false, "mensaje" => $error], JSON_UNESCAPED_UNICODE);
        exit;
    }

    require_once "../conexion.php";

    if (productoDuplicado($conexion, $nombre, $idcategoria, (int) $idproducto)) {
        echo json_encode([
            "estado"  => false,
            "mensaje" => "Ya existe otro producto con ese nombre en la categoría seleccionada"
        ], JSON_UNESCAPED_UNICODE);
        $conexion->close();
        exit;
    }

    $sql = "UPDATE producto SET nombre=?, descripcion=?, id_categoria=?, alto_cm=?, ancho_cm=?, profundidad_cm=?, peso_kg=?, material=?, precio_venta=?, stock_minimo=? WHERE id_producto=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssissssssii", $nombre, $descripcion, $idcategoria, $alto, $ancho, $profundidad, $peso, $material, $precio, $stockminimo, $idproducto);

    if ($stmt->execute()) {
        echo json_encode([
            "estado"  => true,
            "mensaje" => "Datos Modificados Correctamente"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "estado"  => false,
            "mensaje" => "Error al modificar los datos"
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    $conexion->close();
}

if ($opcion == "cambiarEstado") {
    if (!ctype_digit((string) $idproducto) || (int) $idproducto <= 0 || !in_array($estado, ['activo', 'inactivo'], true)) {
        echo json_encode(["estado" => false, "mensaje" => "Datos no válidos"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    require_once "../conexion.php";

    $sql = "UPDATE producto SET estado=? WHERE id_producto=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("si", $estado, $idproducto);

    if ($stmt->execute()) {
        echo json_encode([
            "estado"  => true,
            "mensaje" => $estado == "inactivo" ? "Producto dado de baja correctamente" : "Producto reactivado correctamente"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "estado"  => false,
            "mensaje" => "Error al cambiar el estado"
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    $conexion->close();
}

if ($opcion == "consultar") {
    require_once "../conexion.php";
    try {
        $sql = "SELECT p.id_producto, p.nombre, c.nombre AS categoria,
                       p.material, p.alto_cm, p.ancho_cm, p.profundidad_cm, p.peso_kg,
                       p.stock_minimo, p.precio_venta, p.estado, 0 AS existencia
                FROM producto AS p
                INNER JOIN categoria AS c ON c.id_categoria = p.id_categoria
                ORDER BY p.nombre";
        $resultado = $conexion->query($sql);
        if (!$resultado) {
            throw new Exception("Error al consultar los registros");
        }

        $productos = [];
        while ($fila = $resultado->fetch_assoc()) {
            $productos[] = [
                'id_producto'  => $fila['id_producto'],
                'nombre'       => $fila['nombre'],
                'categoria'    => $fila['categoria'],
                'material'     => $fila['material'],
                'alto'         => $fila['alto_cm'],
                'ancho'        => $fila['ancho_cm'],
                'profundidad'  => $fila['profundidad_cm'],
                'peso_kg'      => $fila['peso_kg'],
                'stock_minimo' => $fila['stock_minimo'],
                'existencia'   => $fila['existencia'],
                'precio_venta' => $fila['precio_venta'],
                'estado'       => $fila['estado']
            ];
        }

        echo json_encode($productos, JSON_UNESCAPED_UNICODE);
        $resultado->free();
        $conexion->close();
    } catch (Throwable $e) {
        echo json_encode([
            "mensaje" => "No se pudieron obtener los registros"
        ], JSON_UNESCAPED_UNICODE);
    }
}

if ($opcion == "consultarIndividual") {
    require_once "../conexion.php";

    $sql = "SELECT p.id_producto, p.nombre, p.descripcion, p.id_categoria,
                   c.nombre AS categoria, p.alto_cm, p.ancho_cm, p.profundidad_cm,
                   p.peso_kg, p.material, p.precio_venta, p.stock_minimo, p.estado
            FROM producto AS p
            INNER JOIN categoria AS c ON c.id_categoria = p.id_categoria
            WHERE p.id_producto=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idproducto);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $datos = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos"  => [
                "id_producto"  => $datos["id_producto"],
                "nombre"       => $datos["nombre"],
                "descripcion"  => $datos["descripcion"],
                "id_categoria" => $datos["id_categoria"],
                "categoria"    => $datos["categoria"],
                "alto"         => $datos["alto_cm"],
                "ancho"        => $datos["ancho_cm"],
                "profundidad"  => $datos["profundidad_cm"],
                "peso_kg"      => $datos["peso_kg"],
                "material"     => $datos["material"],
                "precio_venta" => $datos["precio_venta"],
                "stock_minimo" => $datos["stock_minimo"],
                "estado"       => $datos["estado"]
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "estado" => false,
            "datos"  => "No Existe"
        ], JSON_UNESCAPED_UNICODE);
    }

    $stmt->close();
    $conexion->close();
}

function vacioANulo($valor) {
    $valor = trim((string) $valor);
    return $valor === '' ? null : $valor;
}

function esDecimal($valor, $maximo) {
    return preg_match('/^\d{1,10}(\.\d{1,2})?$/', (string) $valor) === 1 && (float) $valor <= $maximo;
}

function validarProducto($nombre, $idcategoria, $descripcion, $material, $alto, $ancho, $profundidad, $peso, $precio, $stockminimo) {
    if ($nombre == "" || mb_strlen($nombre) > 120) {
        return "El nombre es obligatorio (máximo 120 caracteres)";
    }
    if (!ctype_digit((string) $idcategoria) || (int) $idcategoria <= 0) {
        return "Seleccione una categoría";
    }
    if ($descripcion !== null && mb_strlen($descripcion) > 255) {
        return "La descripción no puede pasar de 255 caracteres";
    }
    if ($material !== null && mb_strlen($material) > 50) {
        return "El material no puede pasar de 50 caracteres";
    }
    $medidas = ["El alto" => $alto, "El ancho" => $ancho, "La profundidad" => $profundidad, "El peso" => $peso];
    foreach ($medidas as $etiqueta => $valor) {
        if ($valor !== null && !esDecimal($valor, 999.99)) {
            return "$etiqueta debe ser un número entre 0 y 999.99 (máximo 2 decimales)";
        }
    }
    if (!esDecimal($precio, 9999.99)) {
        return "El precio de venta debe ser un número entre 0 y 9999.99 (máximo 2 decimales)";
    }
    if (preg_match('/^\d{1,9}$/', (string) $stockminimo) !== 1) {
        return "El stock mínimo debe ser un entero mayor o igual a 0";
    }
    return null;
}

function productoDuplicado($conexion, $nombre, $idcategoria, $idexcluir) {
    $sql = "SELECT id_producto FROM producto WHERE nombre=? AND id_categoria=? AND id_producto<>?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sii", $nombre, $idcategoria, $idexcluir);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $existe = $resultado->num_rows > 0;
    $stmt->close();
    return $existe;
}