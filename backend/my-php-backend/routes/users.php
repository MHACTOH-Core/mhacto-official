<?php
use App\Config\Database;
use App\Models\User;
use App\Core\Auth;
use App\Core\Response;
/**
 * Route: /api/users
 *
 * GET    /api/users                              — list all active users
 * GET    /api/users?all=1                        — list all users including archived
 * GET    /api/users/{id}                         — single user
 * GET    /api/users/archive-requests             — list archive requests (super_admin)
 * POST   /api/users                              — create new user
 * POST   /api/users/archive-requests             — create archive request (admin → super_admin)
 * PUT    /api/users/{id}                         — update user
 * PUT    /api/users/{id}/restore                 — restore archived user
 * PUT    /api/users/{id}/change-password         — change password (old + new)
 * PUT    /api/users/archive-requests/{id}/approve — approve archive request
 * PUT    /api/users/archive-requests/{id}/deny    — deny archive request
 * DELETE /api/users/{id}                         — archive (soft-delete) user
 */

function handle_users(string $method, ?string $param1, ?string $param2): void
{
    // All user management operations require authentication
    if ($method !== 'GET') {
        Auth::requireAuth();
    }

    try {
        $db = (new Database())->getConnection();
        $user = new User($db);

        // Restore action: PUT /api/users/{id}/restore
        if ($method === 'PUT' && $param2 === 'restore' && $param1 && is_numeric($param1)) {
            $restored = $user->restore((int) $param1);
            if ($restored) {
                Response::json(['message' => 'User restored successfully.']);
            } else {
                Response::error('Failed to restore user.', 400);
            }
            return;
        }

        // Preferences: GET/PUT /api/users/{id}/preferences
        if (in_array($method, ['GET', 'PUT']) && $param2 === 'preferences' && $param1 && is_numeric($param1)) {
            $id = (int) $param1;
            if ($method === 'GET') {
                $prefs = $user->getPreferences($id);
                Response::json($prefs);
            } else {
                $data = json_decode(file_get_contents('php://input'), true);
                if (!is_array($data)) {
                    Response::error('Invalid preferences data.', 400);
                }
                $result = $user->updatePreferences($id, $data);
                if ($result) {
                    Response::json(['message' => 'Preferences updated.', 'preferences' => $user->getPreferences($id)]);
                } else {
                    Response::error('Failed to update preferences.', 400);
                }
            }
            return;
        }

        // Change password: PUT /api/users/{id}/change-password
        if ($method === 'PUT' && $param2 === 'change-password' && $param1 && is_numeric($param1)) {
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['oldPassword']) || empty($data['newPassword'])) {
                Response::error('Current password and new password are required.', 400);
            }
            if (strlen($data['newPassword']) < 6) {
                Response::error('New password must be at least 6 characters.', 400);
            }
            $result = $user->changePassword((int) $param1, $data['oldPassword'], $data['newPassword']);
            if ($result === true) {
                Response::json(['message' => 'Password changed successfully.']);
            } else {
                Response::error(is_string($result) ? $result : 'Failed to change password.', 400);
            }
            return;
        }

        // ── Archive Requests ──────────────────────────────────────────

        // GET /api/users/archive-requests — list pending archive requests
        if ($method === 'GET' && $param1 === 'archive-requests') {
            $status = $_GET['status'] ?? 'pending';
            Response::json($user->listArchiveRequests($status));
            return;
        }

        // POST /api/users/archive-requests — admin creates request to archive a super_admin
        if ($method === 'POST' && $param1 === 'archive-requests') {
            $authUser = Auth::requireAuth();
            $data = json_decode(file_get_contents('php://input'), true);
            if (empty($data['targetUserId'])) {
                Response::error('Target user ID is required.', 400);
            }
            $targetId = (int) $data['targetUserId'];
            if ($targetId === 1) {
                Response::error('Cannot request archival of the primary super admin.', 403);
            }
            $requestId = $user->createArchiveRequest($targetId, (int) $authUser['user_id'], $data['reason'] ?? null);
            if ($requestId) {
                Response::json(['message' => 'Archive request submitted for approval.', 'requestId' => $requestId], 201);
            } else {
                Response::error('Failed to create request. A pending request may already exist.', 400);
            }
            return;
        }

        // PUT /api/users/archive-requests/approve  body: { requestId }
        if ($method === 'PUT' && $param1 === 'archive-requests' && $param2 === 'approve') {
            $authUser = Auth::requireAuth();
            if ($authUser['role'] !== 'super_admin') {
                Response::error('Only super admins can approve archive requests.', 403);
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $requestId = (int) ($data['requestId'] ?? 0);
            if (!$requestId) {
                Response::error('Request ID is required.', 400);
            }
            if ($user->approveArchiveRequest($requestId, (int) $authUser['user_id'])) {
                Response::json(['message' => 'Archive request approved. User has been archived.']);
            } else {
                Response::error('Failed to approve request.', 400);
            }
            return;
        }

        // PUT /api/users/archive-requests/deny  body: { requestId }
        if ($method === 'PUT' && $param1 === 'archive-requests' && $param2 === 'deny') {
            $authUser = Auth::requireAuth();
            if ($authUser['role'] !== 'super_admin') {
                Response::error('Only super admins can deny archive requests.', 403);
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $requestId = (int) ($data['requestId'] ?? 0);
            if (!$requestId) {
                Response::error('Request ID is required.', 400);
            }
            if ($user->denyArchiveRequest($requestId, (int) $authUser['user_id'])) {
                Response::json(['message' => 'Archive request denied.']);
            } else {
                Response::error('Failed to deny request.', 400);
            }
            return;
        }

        switch ($method) {
            case 'GET':
                if ($param1 && is_numeric($param1)) {
                    // Single user
                    $result = $user->findById((int) $param1);
                    if ($result) {
                        Response::json($result);
                    } else {
                        Response::error('User not found.', 404);
                    }
                } else {
                    // List users
                    $includeArchived = !empty($_GET['all']);
                    Response::json($user->listAll($includeArchived));
                }
                break;

            case 'POST':
                $data = Response::getJsonInput();

                if (empty($data->email) || empty($data->password) || empty($data->fullName)) {
                    Response::error('Full name, email, and password are required.', 400);
                }

                $role = $data->role ?? 'admin';
                $result = $user->create($data->fullName, $data->email, $data->password, $role);

                if ($result) {
                    Response::json([
                        'message' => 'User created successfully.',
                        'user'    => $result,
                    ], 201);
                } else {
                    Response::error('Failed to create user. Email may already exist.', 400);
                }
                break;

            case 'PUT':
                if (!$param1 || !is_numeric($param1)) {
                    Response::error('User ID is required.', 400);
                }

                $id = (int) $param1;
                $data = json_decode(file_get_contents('php://input'), true);

                if (!$data) {
                    Response::error('No data provided.', 400);
                }

                // Protect main super_admin from role changes
                if ($id === 1 && isset($data['role']) && $data['role'] !== 'super_admin') {
                    Response::error('Cannot change the role of the main super admin.', 403);
                }

                $result = $user->update($id, $data);
                if ($result) {
                    Response::json([
                        'message' => 'User updated successfully.',
                        'user'    => $result,
                    ]);
                } else {
                    Response::error('Failed to update user. Email may already exist.', 400);
                }
                break;

            case 'DELETE':
                if (!$param1 || !is_numeric($param1)) {
                    Response::error('User ID is required.', 400);
                }

                $id = (int) $param1;

                // Protect main super_admin
                if ($id === 1) {
                    Response::error('Cannot archive the main super admin account.', 403);
                }

                $authUser = Auth::requireAuth();

                // Check if target is a super_admin
                $targetUser = $user->findById($id);
                if (!$targetUser) {
                    Response::error('User not found.', 404);
                }

                if ($targetUser['role'] === 'super_admin' && $authUser['role'] !== 'super_admin') {
                    // Admin trying to archive a super_admin → create approval request
                    $requestId = $user->createArchiveRequest($id, (int) $authUser['user_id'], 'Requested via account management.');
                    if ($requestId) {
                        Response::json(['message' => 'Archive request submitted for super admin approval.', 'requiresApproval' => true, 'requestId' => $requestId], 202);
                    } else {
                        Response::error('Failed to create request. A pending request may already exist.', 400);
                    }
                } else {
                    // Super_admin archiving another super_admin, or archiving non-super_admin
                    $result = $user->archive($id);
                    if ($result) {
                        Response::json(['message' => 'User archived successfully.']);
                    } else {
                        Response::error('Failed to archive user.', 400);
                    }
                }
                break;

            default:
                Response::error('Method not allowed.', 405);
        }
    } catch (Exception $e) {
        error_log("users route error: " . $e->getMessage());
        Response::error('Internal server error.', 500);
    }
}
