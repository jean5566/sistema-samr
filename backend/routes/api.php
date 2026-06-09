<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\EstudianteController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::get('registro-estado', [AuthController::class, 'registroEstado']);
Route::post('register', [AuthController::class, 'register']);
Route::get('docentes', [DocenteController::class, 'index']);
Route::get('noticias', [NoticiaController::class, 'indexPublicadas']);
Route::get('documentos', [DocumentoController::class, 'indexPublicos']);
Route::get('documentos/{documento}/download', [DocumentoController::class, 'download']);
Route::get('categorias', [CategoriaController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::post('users/{user}/aprobar', [UserController::class, 'aprobar']);
    Route::post('users/{user}/rechazar', [UserController::class, 'rechazar']);
    Route::apiResource('users', UserController::class);
    Route::get('admin/stats', [StatsController::class, 'index']);
    Route::get('noticias/todas', [NoticiaController::class, 'index']);
    Route::get('documentos/todos', [DocumentoController::class, 'index']);
    Route::apiResource('documentos', DocumentoController::class)->except('index', 'show');
    Route::post('noticias/{noticia}/destacar', [NoticiaController::class, 'destacar']);
    Route::apiResource('noticias', NoticiaController::class)->except('index', 'show');
    Route::apiResource('categorias', CategoriaController::class)->except('index', 'show');

    Route::post('docentes/{docente}/foto', [DocenteController::class, 'updateFoto']);
    Route::apiResource('docentes', DocenteController::class)->except('index');

    Route::get('configuracion/log', [ConfiguracionController::class, 'log']);
    Route::get('configuracion', [ConfiguracionController::class, 'index']);
    Route::post('configuracion', [ConfiguracionController::class, 'update']);
    Route::put('estudiante/docentes/{docente}', [EstudianteController::class, 'updateDocentePerfil']);
});

Route::get('noticias/{noticia}', [NoticiaController::class, 'show']);
