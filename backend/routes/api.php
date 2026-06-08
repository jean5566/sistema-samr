<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DocumentoController;
use App\Http\Controllers\DocenteController;
use App\Http\Controllers\NoticiaController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);
Route::get('docentes', [DocenteController::class, 'index']);
Route::get('noticias', [NoticiaController::class, 'indexPublicadas']);
Route::get('documentos', [DocumentoController::class, 'indexPublicos']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('users', UserController::class);
    Route::get('admin/stats', [StatsController::class, 'index']);
    Route::get('noticias/todas', [NoticiaController::class, 'index']);
    Route::get('documentos/todos', [DocumentoController::class, 'index']);
    Route::apiResource('documentos', DocumentoController::class)->except('index', 'show');
    Route::post('noticias/{noticia}/destacar', [NoticiaController::class, 'destacar']);
    Route::apiResource('noticias', NoticiaController::class)->except('index', 'show');

    Route::post('docentes/{docente}/foto', [DocenteController::class, 'updateFoto']);
    Route::apiResource('docentes', DocenteController::class)->except('index');
});
