<?php
namespace App\Core;

/**
 * core/Validator.php — Reusable input validation utilities.
 *
 * Usage:
 *   require_once __DIR__ . '/Validator.php';
 *
 *   $errors = Validator::validate($data, [
 *       'email'   => 'required|email|max:255',
 *       'name'    => 'required|string|min:2|max:200',
 *       'phone'   => 'phone',
 *       'count'   => 'integer|min:1|max:500',
 *   ]);
 *
 *   if ($errors) {
 *       Response::error(implode(' ', $errors), 400);
 *   }
 */

class Validator
{
    /**
     * Validate an associative array against a set of rules.
     *
     * @param  array<string, mixed>  $data   The input data
     * @param  array<string, string> $rules  Field => pipe-separated rules
     * @return string[]  Array of error messages (empty if valid)
     */
    public static function validate(array $data, array $rules): array
    {
        $errors = [];

        foreach ($rules as $field => $ruleString) {
            $value = $data[$field] ?? null;
            $fieldRules = explode('|', $ruleString);

            foreach ($fieldRules as $rule) {
                $params = [];
                if (str_contains($rule, ':')) {
                    [$rule, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                }

                $error = self::applyRule($field, $value, $rule, $params);
                if ($error !== null) {
                    $errors[] = $error;
                    break; // Stop at first error per field
                }
            }
        }

        return $errors;
    }

    /**
     * Apply a single rule to a value.
     *
     * @return string|null  Error message or null if valid
     */
    private static function applyRule(string $field, mixed $value, string $rule, array $params): ?string
    {
        $label = ucfirst(str_replace('_', ' ', $field));

        switch ($rule) {
            case 'required':
                if ($value === null || $value === '') {
                    return "{$label} is required.";
                }
                break;

            case 'string':
                if ($value !== null && !is_string($value)) {
                    return "{$label} must be a string.";
                }
                break;

            case 'integer':
                if ($value !== null && $value !== '' && filter_var($value, FILTER_VALIDATE_INT) === false) {
                    return "{$label} must be a whole number.";
                }
                break;

            case 'email':
                if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    return "{$label} must be a valid email address.";
                }
                break;

            case 'phone':
                // Accepts: digits, spaces, dashes, parens, plus sign; 7-20 chars
                if ($value !== null && $value !== '') {
                    $cleaned = preg_replace('/[\s\-\(\)\+]/', '', (string) $value);
                    if (!ctype_digit($cleaned) || strlen($cleaned) < 7 || strlen($cleaned) > 15) {
                        return "{$label} must be a valid phone number.";
                    }
                }
                break;

            case 'min':
                if ($value !== null && $value !== '') {
                    $min = (int) ($params[0] ?? 0);
                    if (is_string($value) && mb_strlen($value) < $min) {
                        return "{$label} must be at least {$min} characters.";
                    }
                    if (is_numeric($value) && (float) $value < $min) {
                        return "{$label} must be at least {$min}.";
                    }
                }
                break;

            case 'max':
                if ($value !== null && $value !== '') {
                    $max = (int) ($params[0] ?? PHP_INT_MAX);
                    if (is_string($value) && mb_strlen($value) > $max) {
                        return "{$label} must not exceed {$max} characters.";
                    }
                    if (is_numeric($value) && (float) $value > $max) {
                        return "{$label} must not exceed {$max}.";
                    }
                }
                break;

            case 'in':
                if ($value !== null && $value !== '' && !in_array($value, $params, true)) {
                    return "{$label} must be one of: " . implode(', ', $params) . ".";
                }
                break;

            case 'date':
                if ($value !== null && $value !== '') {
                    $d = \DateTime::createFromFormat('Y-m-d', (string) $value);
                    if (!$d || $d->format('Y-m-d') !== (string) $value) {
                        return "{$label} must be a valid date (YYYY-MM-DD).";
                    }
                }
                break;
        }

        return null;
    }
}
