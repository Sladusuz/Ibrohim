<?php
declare(strict_types=1);

/**
 * File-based storage for contact form submissions.
 *
 * The data file carries a ".php" extension and starts with an exit guard,
 * so a direct HTTP request to it always gets a blank 403-style response
 * from the PHP engine itself — the JSON payload is never served, no
 * matter how the webserver is configured.
 */

define('CONTACT_DATA_DIR', __DIR__ . '/data');
define('CONTACT_DATA_FILE', CONTACT_DATA_DIR . '/messages.php');
define('CONTACT_DATA_GUARD', "<?php http_response_code(403); exit; ?>\n");

function contact_storage_with_lock(callable $fn)
{
    if (!is_dir(CONTACT_DATA_DIR) && !mkdir(CONTACT_DATA_DIR, 0750, true) && !is_dir(CONTACT_DATA_DIR)) {
        throw new RuntimeException('Unable to create storage directory.');
    }
    $lockFile = CONTACT_DATA_DIR . '/.lock';
    $fp = fopen($lockFile, 'c');
    if ($fp === false) {
        throw new RuntimeException('Storage lock unavailable.');
    }
    flock($fp, LOCK_EX);
    try {
        return $fn();
    } finally {
        flock($fp, LOCK_UN);
        fclose($fp);
    }
}

function contact_storage_load(): array
{
    if (!is_file(CONTACT_DATA_FILE)) {
        return [];
    }
    $raw = file_get_contents(CONTACT_DATA_FILE);
    if ($raw === false) {
        throw new RuntimeException('Unable to read message storage.');
    }
    $pos = strpos($raw, '?>');
    $json = $pos === false ? $raw : substr($raw, $pos + 2);
    $json = trim($json);
    if ($json === '') {
        return [];
    }
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function contact_storage_save(array $messages): void
{
    if (!is_dir(CONTACT_DATA_DIR) && !mkdir(CONTACT_DATA_DIR, 0750, true) && !is_dir(CONTACT_DATA_DIR)) {
        throw new RuntimeException('Unable to create storage directory.');
    }
    $json = json_encode(array_values($messages), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false) {
        throw new RuntimeException('Unable to encode messages.');
    }
    $tmp = CONTACT_DATA_FILE . '.tmp';
    if (file_put_contents($tmp, CONTACT_DATA_GUARD . $json) === false) {
        throw new RuntimeException('Unable to write message storage.');
    }
    if (!rename($tmp, CONTACT_DATA_FILE)) {
        throw new RuntimeException('Unable to finalize message storage.');
    }
}

/** Adds a new message and returns it (including its assigned id). */
function contact_storage_add(array $entry): array
{
    return contact_storage_with_lock(function () use ($entry) {
        $messages = contact_storage_load();
        $nextId = 1;
        foreach ($messages as $m) {
            if (($m['id'] ?? 0) >= $nextId) {
                $nextId = (int) $m['id'] + 1;
            }
        }
        $entry['id'] = $nextId;
        $entry['created_at'] = date('Y-m-d H:i:s');
        $entry['read'] = false;
        $messages[] = $entry;
        contact_storage_save($messages);
        return $entry;
    });
}

function contact_storage_all(): array
{
    $messages = contact_storage_load();
    usort($messages, fn($a, $b) => ($b['id'] ?? 0) <=> ($a['id'] ?? 0));
    return $messages;
}

function contact_storage_set_read(int $id, bool $read): void
{
    contact_storage_with_lock(function () use ($id, $read) {
        $messages = contact_storage_load();
        foreach ($messages as &$m) {
            if ((int) ($m['id'] ?? 0) === $id) {
                $m['read'] = $read;
            }
        }
        unset($m);
        contact_storage_save($messages);
    });
}

function contact_storage_delete(int $id): void
{
    contact_storage_with_lock(function () use ($id) {
        $messages = contact_storage_load();
        $messages = array_values(array_filter(
            $messages,
            fn($m) => (int) ($m['id'] ?? 0) !== $id
        ));
        contact_storage_save($messages);
    });
}
