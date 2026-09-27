<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => (($_SERVER['HTTPS'] ?? '') !== '') || (($_SERVER['SERVER_PORT'] ?? '') === '443'),
    ]);
    session_name('impro_admin_session');
    session_start();
}

function admin_is_logged_in(): bool
{
    return !empty($_SESSION['admin_authed']);
}

function admin_require_login(): void
{
    if (!admin_is_logged_in()) {
        header('Location: login.php');
        exit;
    }
}

function admin_csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function admin_csrf_check(string $token): bool
{
    return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/** Simple in-session throttle: a short forced delay after repeated failures. */
function admin_login_throttle(): void
{
    $attempts = (int) ($_SESSION['login_attempts'] ?? 0);
    if ($attempts >= 3) {
        usleep(min(3_000_000, ($attempts - 2) * 700_000));
    }
}

function admin_login_attempt(string $password): bool
{
    global $config;
    admin_login_throttle();

    if (password_verify($password, $config['password_hash'])) {
        $_SESSION['admin_authed'] = true;
        $_SESSION['login_attempts'] = 0;
        session_regenerate_id(true);
        return true;
    }

    $_SESSION['login_attempts'] = (int) ($_SESSION['login_attempts'] ?? 0) + 1;
    return false;
}
