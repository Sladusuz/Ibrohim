<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';

if (admin_is_logged_in()) {
    header('Location: index.php');
    exit;
}

$error = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $token = (string) ($_POST['csrf_token'] ?? '');
    if (!admin_csrf_check($token)) {
        $error = 'Сессия истекла, попробуйте ещё раз.';
    } elseif (admin_login_attempt((string) ($_POST['password'] ?? ''))) {
        header('Location: index.php');
        exit;
    } else {
        $error = 'Неверный пароль.';
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Вход — Админ-панель IMPRO</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #0e0e10; font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .card {
      background: #1b1b1f; border: 1px solid #2c2c31; border-radius: 12px;
      padding: 32px; width: 100%; max-width: 360px;
    }
    h1 { color: #d4a017; font-size: 1.25rem; margin: 0 0 20px; text-align: center; }
    label { color: #aaa; font-size: .85rem; display: block; margin-bottom: 6px; }
    input[type=password] {
      width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #333;
      background: #101012; color: #eee; font-size: 1rem; margin-bottom: 16px;
    }
    button {
      width: 100%; padding: 10px 12px; border-radius: 8px; border: none;
      background: #d4a017; color: #16130a; font-weight: 600; font-size: 1rem; cursor: pointer;
    }
    button:hover { background: #e6b52b; }
    .error { background: #3a1414; color: #ff8080; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; font-size: .9rem; }
  </style>
</head>
<body>
  <form class="card" method="post" autocomplete="off">
    <h1>IMPRO — Админ-панель</h1>
    <?php if ($error !== ''): ?>
      <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>
    <input type="hidden" name="csrf_token" value="<?= htmlspecialchars(admin_csrf_token(), ENT_QUOTES, 'UTF-8') ?>">
    <label for="password">Пароль</label>
    <input type="password" id="password" name="password" required autofocus>
    <button type="submit">Войти</button>
  </form>
</body>
</html>
