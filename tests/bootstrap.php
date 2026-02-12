<?php
// Load BGA mock framework (provides Table, APP_DbObject, etc.)
define('APP_GAMEMODULE_PATH', __DIR__ . '/../node_modules/bga-ts-template/server/module/');
require_once APP_GAMEMODULE_PATH . 'table/table.game.php';

// Load Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';
