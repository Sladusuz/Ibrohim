<?php
declare(strict_types=1);

require __DIR__ . '/auth.php';
admin_require_login();
require __DIR__ . '/../storage/storage.php';

$notice = '';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $token = (string) ($_POST['csrf_token'] ?? '');
    if (!admin_csrf_check($token)) {
        $notice = 'Сессия истекла, действие не выполнено. Обновите страницу.';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        $action = (string) ($_POST['action'] ?? '');
        if ($id > 0 && $action === 'mark_read') {
            contact_storage_set_read($id, true);
        } elseif ($id > 0 && $action === 'mark_unread') {
            contact_storage_set_read($id, false);
        } elseif ($id > 0 && $action === 'delete') {
            contact_storage_delete($id);
        }
        header('Location: index.php');
        exit;
    }
}

$messages = contact_storage_all();
$unreadCount = count(array_filter($messages, fn($m) => empty($m['read'])));

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Обращения — Админ-панель IMPRO</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: #0e0e10; color: #e8e8e8;
      font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    }
    header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 24px; border-bottom: 1px solid #2c2c31; background: #17171a;
    }
    header h1 { font-size: 1.1rem; color: #d4a017; margin: 0; }
    header a { color: #aaa; text-decoration: none; font-size: .9rem; }
    header a:hover { color: #fff; }
    main { max-width: 900px; margin: 0 auto; padding: 24px; }
    .empty { color: #888; text-align: center; padding: 60px 0; }
    .notice { background: #3a2f14; color: #f0c060; border-radius: 8px; padding: 10px 14px; margin-bottom: 18px; font-size: .9rem; }
    .summary { color: #999; margin-bottom: 18px; font-size: .9rem; }
    .msg {
      background: #1b1b1f; border: 1px solid #2c2c31; border-radius: 10px;
      padding: 16px 18px; margin-bottom: 14px;
    }
    .msg.unread { border-color: #d4a017; }
    .msg-top { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .msg-subject { font-weight: 600; color: #fff; }
    .msg-meta { color: #888; font-size: .8rem; margin-top: 4px; }
    .msg-body { white-space: pre-wrap; margin: 12px 0; line-height: 1.5; color: #ddd; }
    .badge {
      display: inline-block; font-size: .7rem; padding: 2px 8px; border-radius: 999px;
      background: #d4a017; color: #16130a; font-weight: 700; margin-left: 8px; vertical-align: middle;
    }
    .actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .actions button {
      background: #26262b; color: #ddd; border: 1px solid #3a3a40; border-radius: 6px;
      padding: 6px 12px; font-size: .8rem; cursor: pointer;
    }
    .actions button:hover { background: #333338; }
    .actions button.danger:hover { background: #4a1f1f; border-color: #6b2b2b; color: #ff9a9a; }
    a.email-link { color: #8ab4ff; }
  </style>
</head>
<body>
  <header>
    <h1>IMPRO — Обращения<?= $unreadCount > 0 ? " <span class=\"badge\">$unreadCount новых</span>" : '' ?></h1>
    <a href="logout.php">Выйти</a>
  </header>
  <main>
    <?php if ($notice !== ''): ?>
      <div class="notice"><?= h($notice) ?></div>
    <?php endif; ?>

    <?php if (empty($messages)): ?>
      <p class="empty">Пока нет ни одного обращения с сайта.</p>
    <?php else: ?>
      <p class="summary">Всего обращений: <?= count($messages) ?></p>
      <?php foreach ($messages as $m): ?>
        <?php $isUnread = empty($m['read']); ?>
        <div class="msg <?= $isUnread ? 'unread' : '' ?>">
          <div class="msg-top">
            <div>
              <div class="msg-subject"><?= h((string) ($m['subject'] ?? '')) ?><?= $isUnread ? '<span class="badge">новое</span>' : '' ?></div>
              <div class="msg-meta">
                <?= h((string) ($m['created_at'] ?? '')) ?> ·
                <?= h((string) ($m['name'] ?? '')) ?> ·
                <a class="email-link" href="mailto:<?= h((string) ($m['email'] ?? '')) ?>"><?= h((string) ($m['email'] ?? '')) ?></a>
              </div>
            </div>
          </div>
          <div class="msg-body"><?= h((string) ($m['message'] ?? '')) ?></div>
          <div class="actions">
            <form method="post" style="display:inline">
              <input type="hidden" name="csrf_token" value="<?= h(admin_csrf_token()) ?>">
              <input type="hidden" name="id" value="<?= (int) ($m['id'] ?? 0) ?>">
              <?php if ($isUnread): ?>
                <input type="hidden" name="action" value="mark_read">
                <button type="submit">Отметить прочитанным</button>
              <?php else: ?>
                <input type="hidden" name="action" value="mark_unread">
                <button type="submit">Отметить непрочитанным</button>
              <?php endif; ?>
            </form>
            <form method="post" style="display:inline" onsubmit="return confirm('Удалить это обращение?');">
              <input type="hidden" name="csrf_token" value="<?= h(admin_csrf_token()) ?>">
              <input type="hidden" name="id" value="<?= (int) ($m['id'] ?? 0) ?>">
              <input type="hidden" name="action" value="delete">
              <button type="submit" class="danger">Удалить</button>
            </form>
          </div>
        </div>
      <?php endforeach; ?>
    <?php endif; ?>
  </main>
</body>
</html>
