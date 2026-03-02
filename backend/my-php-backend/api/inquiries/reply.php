<?php
/**
 * POST /api/inquiries/reply.php
 *
 * DEPRECATED — reply functionality removed in schema v3.
 * The inquiries table no longer stores replies.
 * This endpoint returns 410 Gone.
 */

require_once __DIR__ . '/../../core/Response.php';

Response::cors();
Response::preflight();

Response::error('Reply endpoint has been removed. Inquiries no longer support inline replies.', 410);
