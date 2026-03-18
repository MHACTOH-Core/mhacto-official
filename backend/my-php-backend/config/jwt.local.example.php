<?php
/**
 * JWT configuration (copy to jwt.local.php and set your own secret).
 *
 * IMPORTANT: jwt.local.php should be git-ignored. Never commit secrets.
 *
 * Generate a strong secret:
 *   php -r "echo bin2hex(random_bytes(32)) . PHP_EOL;"
 */
return [
    'secret' => 'CHANGE_ME_TO_A_RANDOM_64_CHAR_HEX_STRING',
];
