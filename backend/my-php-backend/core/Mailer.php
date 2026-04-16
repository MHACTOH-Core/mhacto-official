<?php
namespace App\Core;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as MailException;

/**
 * core/Mailer.php — PHPMailer wrapper for MHACTO
 *
 * Usage:
 *   // Send reply to visitor
 *   Mailer::sendReply($visitorEmail, $visitorName, $replyMessage, $originalMessage);
 *
 *   // Notify admin of new inquiry
 *   Mailer::notifyAdmin($name, $email, $message, $inquiryId);
 */

class Mailer
{
    /**
     * Build and return a configured PHPMailer instance.
     */
    private static function make(): PHPMailer
    {
        $cfg = require __DIR__ . '/../config/email.php';

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $cfg['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $cfg['username'];
        $mail->Password   = $cfg['password'];
        $mail->Port       = $cfg['port'];
        $mail->Timeout    = 5; // fail fast if SMTP is unreachable (seconds)
        $mail->CharSet    = PHPMailer::CHARSET_UTF8;

        if ($cfg['encryption'] === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom($cfg['from_email'], $cfg['from_name']);

        return $mail;
    }

    /**
     * Send an admin reply to the visitor's email.
     *
     * @param string $toEmail     Visitor's email address
     * @param string $toName      Visitor's full name
     * @param string $replyText   The reply message typed by the admin
     * @param string $origMessage The visitor's original inquiry message
     */
    public static function sendReply(
        string $toEmail,
        string $toName,
        string $replyText,
        string $origMessage = ''
    ): bool {
        try {
            $mail = self::make();
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = 'Response to your inquiry — MHACTO Bocaue';
            $mail->isHTML(true);
            $mail->Body    = self::replyTemplate($toName, $replyText, $origMessage);
            $mail->AltBody = self::replyTemplatePlain($toName, $replyText, $origMessage);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::sendReply failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify the admin when a new inquiry is submitted.
     *
     * @param string $senderName    Visitor's name
     * @param string $senderEmail   Visitor's email
     * @param string $message       Visitor's inquiry message
     * @param int    $inquiryId     DB inquiry ID
     */
    public static function notifyAdmin(
        string $senderName,
        string $senderEmail,
        string $message,
        int    $inquiryId
    ): bool {
        try {
            $cfg  = require __DIR__ . '/../config/email.php';
            $mail = self::make();
            $mail->addAddress($cfg['admin_email'], $cfg['admin_name']);
            $mail->Subject = "New Inquiry #$inquiryId from $senderName — MHACTO Bocaue";
            $mail->isHTML(true);
            $mail->Body    = self::newInquiryTemplate($senderName, $senderEmail, $message, $inquiryId);
            $mail->AltBody = self::newInquiryTemplatePlain($senderName, $senderEmail, $message, $inquiryId);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::notifyAdmin failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send an automatic acknowledgement email to the visitor after inquiry submission.
     *
     * @param string $toName    Visitor's full name
     * @param string $toEmail   Visitor's email address
     * @param int    $inquiryId DB inquiry ID (used as reference number)
     */
    public static function sendAutoReply(
        string $toName,
        string $toEmail,
        int    $inquiryId
    ): bool {
        try {
            $mail = self::make();
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = "We received your inquiry #$inquiryId — MHACTO Bocaue";
            $mail->isHTML(true);
            $mail->Body    = self::autoReplyTemplate($toName, $inquiryId);
            $mail->AltBody = self::autoReplyTemplatePlain($toName, $inquiryId);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::sendAutoReply failed: " . $e->getMessage());
            return false;
        }
    }

    // ─── HTML Email Templates ─────────────────────────────────────

    private static function replyTemplate(string $name, string $reply, string $original): string
    {
        $name     = htmlspecialchars($name);
        $reply    = nl2br(htmlspecialchars($reply));
        $original = $original ? '<p style="color:#555;font-size:13px;border-left:3px solid #e0e0e0;padding-left:12px;margin-top:16px;">'
            . nl2br(htmlspecialchars($original)) . '</p>' : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">MHACTO Bocaue Tourism</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">Municipal History, Arts, Culture & Tourism Office</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Dear <strong>{$name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#333;">
              Thank you for reaching out to MHACTO Bocaue. We have reviewed your inquiry and here is our response:
            </p>
            <div style="background:#f0fafc;border-left:4px solid #1a9bb5;padding:16px 20px;border-radius:4px;margin:0 0 16px;">
              <p style="margin:0;font-size:15px;color:#222;line-height:1.6;">{$reply}</p>
            </div>
            {$original}
            <p style="margin:24px 0 0;font-size:14px;color:#555;">
              If you have further questions, feel free to visit us or submit another inquiry at our website.
            </p>
            <p style="margin:24px 0 0;font-size:14px;color:#333;">
              Warm regards,<br>
              <strong>MHACTO Bocaue Tourism Office</strong><br>
              Bocaue, Bulacan, Philippines
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This is an automated reply from MHACTO Bocaue Tourism Office.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function replyTemplatePlain(string $name, string $reply, string $original): string
    {
        $out = "Dear {$name},\n\n";
        $out .= "Thank you for reaching out to MHACTO Bocaue. Here is our response:\n\n";
        $out .= $reply . "\n\n";
        if ($original) {
            $out .= "--- Your original message ---\n" . $original . "\n";
        }
        $out .= "\nWarm regards,\nMHACTO Bocaue Tourism Office\nBocaue, Bulacan, Philippines";
        return $out;
    }

    private static function newInquiryTemplate(string $name, string $email, string $message, int $id): string
    {
        $name    = htmlspecialchars($name);
        $email   = htmlspecialchars($email);
        $message = nl2br(htmlspecialchars($message));

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:18px;font-weight:bold;color:#ffffff;">New Inquiry Received — #$id</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">MHACTO Bocaue Admin Notification</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
              <tr><td style="font-size:13px;color:#777;width:130px;">From</td><td style="font-size:14px;color:#333;font-weight:bold;">{$name}</td></tr>
              <tr style="background:#f9f9f9;"><td style="font-size:13px;color:#777;">Email</td><td style="font-size:14px;color:#333;">{$email}</td></tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#777;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
            <div style="background:#fafafa;border:1px solid #e8e8e8;padding:16px;border-radius:4px;">
              <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">{$message}</p>
            </div>
            <p style="margin:24px 0 0;font-size:13px;color:#555;">
              Log in to the admin panel to view and reply to this inquiry.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">MHACTO Bocaue Admin Notification — Do not reply to this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function newInquiryTemplatePlain(string $name, string $email, string $message, int $id): string
    {
        return "New Inquiry #{$id}\n\nFrom: {$name}\nEmail: {$email}\n\nMessage:\n{$message}\n\n"
             . "Log in to the admin panel to reply.";
    }

    // ─── Tour Notification Methods ─────────────────────────────────

    /**
     * Notify the visitor that their tour has been confirmed.
     */
    public static function sendTourConfirmed(
        string $toEmail,
        string $toName,
        string $confirmedDate,
        string $guideName = '',
        string $pax = ''
    ): bool {
        if (!$toEmail || str_ends_with($toEmail, '@noemail.local')) return false;
        try {
            $mail = self::make();
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = 'Your Tour Has Been Confirmed — MHACTO Bocaue';
            $mail->isHTML(true);
            $mail->Body    = self::tourConfirmedTemplate($toName, $confirmedDate, $guideName, $pax);
            $mail->AltBody = self::tourConfirmedTemplatePlain($toName, $confirmedDate, $guideName, $pax);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::sendTourConfirmed failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify the visitor that their tour has been rescheduled or guide changed.
     */
    public static function sendTourRescheduled(
        string $toEmail,
        string $toName,
        string $newDate,
        string $guideName = ''
    ): bool {
        if (!$toEmail || str_ends_with($toEmail, '@noemail.local')) return false;
        try {
            $mail = self::make();
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = 'Your Tour Schedule Has Been Updated — MHACTO Bocaue';
            $mail->isHTML(true);
            $mail->Body    = self::tourRescheduledTemplate($toName, $newDate, $guideName);
            $mail->AltBody = self::tourRescheduledTemplatePlain($toName, $newDate, $guideName);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::sendTourRescheduled failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Notify the visitor that their tour has been cancelled.
     */
    public static function sendTourCancelled(
        string $toEmail,
        string $toName
    ): bool {
        if (!$toEmail || str_ends_with($toEmail, '@noemail.local')) return false;
        try {
            $mail = self::make();
            $mail->addAddress($toEmail, $toName);
            $mail->Subject = 'Your Tour Has Been Cancelled — MHACTO Bocaue';
            $mail->isHTML(true);
            $mail->Body    = self::tourCancelledTemplate($toName);
            $mail->AltBody = self::tourCancelledTemplatePlain($toName);
            $mail->send();
            return true;
        } catch (\Exception $e) {
            error_log("Mailer::sendTourCancelled failed: " . $e->getMessage());
            return false;
        }
    }

    // ─── Tour Notification Templates ──────────────────────────────

    private static function tourConfirmedTemplate(string $name, string $date, string $guide, string $pax): string
    {
        $name    = htmlspecialchars($name);
        $date    = htmlspecialchars($date);
        $guideRow = $guide
            ? '<tr style="background:#f9f9f9;"><td style="font-size:13px;color:#777;padding:8px;">Tour Guide</td><td style="font-size:14px;color:#333;padding:8px;">' . htmlspecialchars($guide) . '</td></tr>'
            : '';
        $paxRow  = $pax
            ? '<tr><td style="font-size:13px;color:#777;padding:8px;">Group Size</td><td style="font-size:14px;color:#333;padding:8px;">' . htmlspecialchars($pax) . ' pax</td></tr>'
            : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">MHACTO Bocaue Tourism</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">Municipal History, Arts, Culture &amp; Tourism Office</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Dear <strong>{$name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#333;">
              We are pleased to inform you that your tour booking has been <strong style="color:#1a9bb5;">confirmed</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #e8e8e8;border-radius:4px;">
              <tr><td style="font-size:13px;color:#777;padding:8px;">Confirmed Date</td><td style="font-size:14px;color:#333;font-weight:bold;padding:8px;">{$date}</td></tr>
              {$guideRow}
              {$paxRow}
            </table>
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              Please be at the designated meeting point on the confirmed date. If you need to make changes, contact our office as soon as possible.
            </p>
            <p style="margin:24px 0 0;font-size:14px;color:#333;">
              Warm regards,<br>
              <strong>MHACTO Bocaue Tourism Office</strong><br>
              Bocaue, Bulacan, Philippines
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This is an automated notification from MHACTO Bocaue Tourism Office.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function tourConfirmedTemplatePlain(string $name, string $date, string $guide, string $pax): string
    {
        $out = "Dear {$name},\n\nYour tour booking has been confirmed.\n\nConfirmed Date: {$date}\n";
        if ($guide) $out .= "Tour Guide: {$guide}\n";
        if ($pax)   $out .= "Group Size: {$pax} pax\n";
        $out .= "\nPlease be at the meeting point on the confirmed date.\n\nWarm regards,\nMHACTO Bocaue Tourism Office\nBocaue, Bulacan, Philippines";
        return $out;
    }

    private static function tourRescheduledTemplate(string $name, string $newDate, string $guide): string
    {
        $name    = htmlspecialchars($name);
        $newDate = htmlspecialchars($newDate);
        $guideRow = $guide
            ? '<tr style="background:#f9f9f9;"><td style="font-size:13px;color:#777;padding:8px;">Tour Guide</td><td style="font-size:14px;color:#333;padding:8px;">' . htmlspecialchars($guide) . '</td></tr>'
            : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">MHACTO Bocaue Tourism</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">Municipal History, Arts, Culture &amp; Tourism Office</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Dear <strong>{$name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#333;">
              We would like to inform you that your tour booking details have been <strong style="color:#e07a00;">updated</strong>. Please take note of your new schedule below.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #e8e8e8;border-radius:4px;">
              <tr><td style="font-size:13px;color:#777;padding:8px;">New Date</td><td style="font-size:14px;color:#333;font-weight:bold;padding:8px;">{$newDate}</td></tr>
              {$guideRow}
            </table>
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              If you have questions or concerns about this change, please contact our office immediately.
            </p>
            <p style="margin:24px 0 0;font-size:14px;color:#333;">
              Warm regards,<br>
              <strong>MHACTO Bocaue Tourism Office</strong><br>
              Bocaue, Bulacan, Philippines
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This is an automated notification from MHACTO Bocaue Tourism Office.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function tourRescheduledTemplatePlain(string $name, string $newDate, string $guide): string
    {
        $out = "Dear {$name},\n\nYour tour booking has been updated.\n\nNew Date: {$newDate}\n";
        if ($guide) $out .= "Tour Guide: {$guide}\n";
        $out .= "\nIf you have concerns, please contact our office.\n\nWarm regards,\nMHACTO Bocaue Tourism Office\nBocaue, Bulacan, Philippines";
        return $out;
    }

    private static function tourCancelledTemplate(string $name): string
    {
        $name = htmlspecialchars($name);

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">MHACTO Bocaue Tourism</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">Municipal History, Arts, Culture &amp; Tourism Office</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Dear <strong>{$name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:15px;color:#333;">
              We regret to inform you that your tour booking has been <strong style="color:#c0392b;">cancelled</strong>.
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              If you believe this is an error or would like to reschedule, please do not hesitate to contact our office or submit a new inquiry through our website.
            </p>
            <p style="margin:24px 0 0;font-size:14px;color:#333;">
              We apologize for any inconvenience this may have caused and hope to serve you in the future.<br><br>
              Warm regards,<br>
              <strong>MHACTO Bocaue Tourism Office</strong><br>
              Bocaue, Bulacan, Philippines
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This is an automated notification from MHACTO Bocaue Tourism Office.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function tourCancelledTemplatePlain(string $name): string
    {
        return "Dear {$name},\n\nWe regret to inform you that your tour booking has been cancelled.\n\n"
             . "If you believe this is an error or would like to reschedule, please contact our office "
             . "or submit a new inquiry at our website.\n\n"
             . "We apologize for any inconvenience.\n\nWarm regards,\nMHACTO Bocaue Tourism Office\nBocaue, Bulacan, Philippines";
    }

    // ─── Auto-Reply Templates ──────────────────────────────────────

    private static function autoReplyTemplate(string $name, int $id): string
    {
        $name = htmlspecialchars($name);

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#1a9bb5;padding:28px 32px;">
            <p style="margin:0;font-size:20px;font-weight:bold;color:#ffffff;">MHACTO Bocaue Tourism</p>
            <p style="margin:4px 0 0;font-size:13px;color:#d0f0f7;">Municipal History, Arts, Culture &amp; Tourism Office</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#333;">Dear <strong>{$name}</strong>,</p>
            <p style="margin:0 0 16px;font-size:15px;color:#333;">
              Thank you for reaching out to us! We have successfully received your inquiry and our team will review it shortly.
            </p>
            <div style="background:#f0fafc;border-left:4px solid #1a9bb5;padding:16px 20px;border-radius:4px;margin:0 0 20px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;color:#777;">Reference Number</p>
              <p style="margin:0;font-size:26px;font-weight:bold;color:#1a9bb5;">#{$id}</p>
            </div>
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              We typically respond within <strong>1–3 business days</strong>. For urgent matters, you may contact our office directly.
            </p>
            <p style="margin:0 0 16px;font-size:14px;color:#555;">
              Please keep this email for your records. Our team will reply to this email address.
            </p>
            <p style="margin:24px 0 0;font-size:14px;color:#333;">
              Warm regards,<br>
              <strong>MHACTO Bocaue Tourism Office</strong><br>
              Bocaue, Bulacan, Philippines
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f0f0f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This is an automated confirmation from MHACTO Bocaue Tourism Office.<br>
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;
    }

    private static function autoReplyTemplatePlain(string $name, int $id): string
    {
        return "Dear {$name},\n\n"
             . "Thank you for reaching out to us! We have received your inquiry.\n\n"
             . "Reference Number: #{$id}\n\n"
             . "We typically respond within 1–3 business days. For urgent matters, please contact our office directly.\n\n"
             . "Please keep this email for your records. Our team will reply to this email address.\n\n"
             . "Warm regards,\nMHACTO Bocaue Tourism Office\nBocaue, Bulacan, Philippines";
    }
}
