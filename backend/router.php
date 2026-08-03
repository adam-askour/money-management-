<?php
declare(strict_types=1);

$path=parse_url($_SERVER['REQUEST_URI']??'/',PHP_URL_PATH)?:'/';
if(str_starts_with($path,'/api')){require __DIR__.'/public/index.php';return;}

$dist=realpath(__DIR__.'/../dist');
if($dist===false){http_response_code(503);header('Content-Type: text/plain; charset=utf-8');echo 'Frontend build is unavailable. Run npm run build.';return;}

$candidate=realpath($dist.'/'.ltrim($path,'/'));
if($path!=='/'&&$candidate!==false&&str_starts_with($candidate,$dist.DIRECTORY_SEPARATOR)&&is_file($candidate)){
 $types=['css'=>'text/css; charset=utf-8','js'=>'text/javascript; charset=utf-8','png'=>'image/png','jpg'=>'image/jpeg','jpeg'=>'image/jpeg','svg'=>'image/svg+xml','ico'=>'image/x-icon','woff2'=>'font/woff2'];
 header('Content-Type: '.($types[strtolower(pathinfo($candidate,PATHINFO_EXTENSION))]??'application/octet-stream'));
 header('X-Content-Type-Options: nosniff');header('Cache-Control: public, max-age=31536000, immutable');readfile($candidate);return;
}

header("Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
header('X-Content-Type-Options: nosniff');header('X-Frame-Options: DENY');header('Referrer-Policy: no-referrer');header('Permissions-Policy: camera=(), microphone=(), geolocation=()');header('Cache-Control: no-store');header('Content-Type: text/html; charset=utf-8');readfile($dist.'/index.html');
