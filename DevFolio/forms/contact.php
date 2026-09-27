<?php
declare(strict_types=1);

/**
 * Contact form handler.
 *
 * Rebuilt from scratch: the previous version depended on a paid
 * "PHP Email Form" library that was never included in this project, so
 * every single submission used to fail with a fatal
 * "Unable to load the PHP Email Form Library!" error. This version has
 * no external dependency — it saves every message to the admin panel
 * first (so nothing is ever lost), then best-effort emails a copy.
 */

header('Content-Type: text/plain; charset=utf-8');

require __DIR__ . '/../storage/storage.php';

function contact_fail(string $message): void
{
    http_response_code(400);
    echo $message;
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    contact_fail('Invalid request method.');
}

// Honeypot field (hidden from real visitors via CSS in index.html).
// Bots that fill every input will trip this; pretend success so they
// don't retry, but don't store anything.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    echo 'OK';
    exit;
}

$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    contact_fail('Пожалуйста, заполните все поля формы.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    contact_fail('Пожалуйста, укажите корректный email адрес.');
}

if (mb_strlen($name) > 150 || mb_strlen($subject) > 200 || mb_strlen($message) > 5000) {
    contact_fail('Слишком длинное значение одного из полей.');
}

// Defence in depth against mail header injection, even though
// FILTER_VALIDATE_EMAIL already rejects embedded newlines.
$subject = str_replace(["\r", "\n"], ' ', $subject);
$name    = str_replace(["\r", "\n"], ' ', $name);

try {
    contact_storage_add([
        'name'    => $name,
        'email'   => $email,
        'subject' => $subject,
        'message' => $message,
        'ip'      => $_SERVER['REMOTE_ADDR'] ?? '',
    ]);
} catch (Throwable $e) {
    error_log('[contact form] storage failure: ' . $e->getMessage());
    contact_fail('Не удалось сохранить сообщение. Попробуйте позже.');
}

// Best-effort email notification. The message is already saved and
// visible in the admin panel regardless of whether mail() succeeds, so
// a missing/broken mail server on the host can no longer break the
// "your message has been sent" confirmation shown to the visitor.
$receivingEmailAddress = 'chempme@gmail.com';
$emailBody = "Имя: {$name}\nEmail: {$email}\nТема: {$subject}\n\n{$message}\n";
$headers = "From: no-reply@" . preg_replace('/[^a-zA-Z0-9.\-]/', '', $_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n"
    . "Reply-To: {$email}\r\n";
@mail($receivingEmailAddress, '[IMPRO] ' . $subject, $emailBody, $headers);

echo 'OK';
