<?php

$nombre = $_REQUEST["nombre"] ?? '';
$descripcion = $_REQUEST["descripcion"] ?? '';
$ganancia = $_REQUEST["margen_ganancia"] ?? '';
$estado = $_REQUEST["estado"] ?? '';
$id = $_REQUEST['id_categoria'] ?? '';

$opcion = $_REQUEST["opcion"] ?? '';

if ($opcion == "guardar") {
    require_once "../conexion.php";

    //$clave = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO categoria (nombre, descripcion, margen_ganancia, estado) VALUES(?,?,?,?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssds",$nombre, $descripcion, $ganancia, $estado);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Guardados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al guardar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}

if ($opcion == "modificar") {
    require_once "../conexion.php";

    $sql = "UPDATE categoria set nombre=?, descripcion=?, margen_ganancia=?, estado=? WHERE id_categoria=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssdsi", $nombre, $descripcion, $ganancia, $estado, $id);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Modificados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al modificar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}
if ($opcion == "eliminar") {
    
    require_once "../conexion.php";

    $sql = "DELETE FROM categoria WHERE id_categoria=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode([
            "estado" => true,
            "mensaje" => "Datos Eliminados Correctamente"
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "mensaje" => "Error al eliminar los datos"
        ]);
    }
    $stmt->close();
    $conexion->close();
}

// if ($opcion == "consultarDUI") {
//     require_once "../config/conexion.php";

//     $sql = "SELECT dui FROM categoria WHERE dui=?";
//     $stmt = $conexion->prepare($sql);
//     $stmt->bind_param("s", $dui);

//     $stmt->execute();

//     $resultado = $stmt->get_result();

//     if ($resultado->num_rows > 0) {

//         echo json_encode([
//             "estado" => true,
//             "mensaje" => "Este Dui ya existe"
//         ]);
//     } else {
//         echo json_encode([
//             "estado" => false,
//             "mensaje" => "a"
//         ]);
//     }

//     $stmt->close();
//     $conexion->close();
// }

if ($opcion == "consultar") {
    require_once "../conexion.php";

    try {
        $sql = "SELECT id_categoria, nombre, descripcion, margen_ganancia, estado FROM categoria ORDER BY nombre";

        $resultado = $conexion->query($sql);

        if (!$resultado) {
            throw new Exception("Error al consultar");
        }

        $categoria = [];

        while ($fila = $resultado->fetch_assoc()) {
            //$categoria[] = $fila;
            $categoria[] = [
                'id_categoria' => $fila['id_categoria'],
                'nombre' => $fila['nombre'],
                'descripcion' => $fila['descripcion'],
                'margen_ganancia' => $fila['margen_ganancia'],
                'estado' => $fila['estado']
            ];
        }

        echo json_encode(
            $categoria,
            JSON_UNESCAPED_UNICODE
        );

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

    $sql = "SELECT id_categoria, nombre, descripcion, margen_ganancia, estado FROM categoria WHERE id_categoria=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id);

    $stmt->execute();

    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $datos = $resultado->fetch_assoc();
        echo json_encode([
            "estado" => true,
            "datos" => [
                "id_categoria" => $datos["id_categoria"],
                "nombre" => $datos["nombre"],
                "descripcion" => $datos["descripcion"],
                "margen_ganancia" => $datos["margen_ganancia"],
                "estado" => $datos["estado"]
            ]
        ]);
    } else {
        echo json_encode([
            "estado" => false,
            "datos" => "No Existe"
        ]);
    }

    $stmt->close();
    $conexion->close();
}

if ($opcion == "cambiarEstado") {
    require_once "../conexion.php";

    $sql = "UPDATE categoria SET estado=? WHERE id_categoria=?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("si", $estado, $id);
    if ($stmt->execute()) {
        echo json_encode(["estado" => true, "mensaje" => "Estado actualizado correctamente"]);
    } else {
        echo json_encode(["estado" => false, "mensaje" => "Error al cambiar el estado"]);
    }
    $stmt->close();
    $conexion->close();
}