<?php
declare(strict_types=1);

/**
 * Admin panel configuration.
 *
 * The password is stored only as a one-way hash, never in plain text.
 * To change the admin password, run this from the command line and
 * paste the output hash below:
 *
 *   php -r "echo password_hash('your-new-password', PASSWORD_DEFAULT), PHP_EOL;"
 */
return [
    'password_hash' => '$2y$12$/X8HpzM0/wswNDeAC4QJueymNc6Lpbd5M0zo0q2yb2Ioy9BUPZHhS',
];
