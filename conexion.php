<?php
$servidor = "localhost";
$usuario = "root";
$laclave = "";
$bbdd = "comercial_ppi";

$conexion = new mysqli($servidor, $usuario, $laclave, $bbdd);

if ($conexion->connect_error) {
    die("Error de conexion:" . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");