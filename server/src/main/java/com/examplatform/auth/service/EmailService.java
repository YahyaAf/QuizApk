package com.examplatform.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@examplatform.com}")
    private String fromEmail;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.url:http://localhost:3000}")
    private String appUrl;

    /**
     * Sends a password reset email with a secure link.
     * Falls back to console logging if mail is not configured.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String resetToken) {
        if (!mailEnabled) {
            // Fallback: log the token when mail is not configured
            log.info("================================================================================");
            log.info("[SIMULATION EMAIL] Destinataire : {}", toEmail);
            log.info("[SIMULATION EMAIL] Lien de réinitialisation : {}/reset-password?token={}", appUrl, resetToken);
            log.info("[SIMULATION EMAIL] Pour activer le vrai envoi d'emails, définissez MAIL_ENABLED=true");
            log.info("================================================================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Réinitialisation de votre mot de passe — ExamPlatform");
            helper.setText(buildPasswordResetHtml(userName, resetToken), true);

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Sends a welcome email to a newly registered user.
     */
    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String role) {
        if (!mailEnabled) {
            log.info("[SIMULATION EMAIL] Bienvenue à {} ({}). Email de bienvenue non envoyé (mail désactivé).", userName, toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎓 Bienvenue sur ExamPlatform !");
            helper.setText(buildWelcomeHtml(userName, role), true);

            mailSender.send(message);
            log.info("Welcome email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Notifies a student that their exam has been manually graded.
     */
    @Async
    public void sendGradingCompleteEmail(String toEmail, String studentName, String examTitle, double percentage, boolean passed) {
        if (!mailEnabled) {
            log.info("[SIMULATION EMAIL] Notation terminée pour {} — Examen: {}, Score: {}%", studentName, examTitle, percentage);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("📋 Votre examen \"" + examTitle + "\" a été corrigé — ExamPlatform");
            helper.setText(buildGradingCompleteHtml(studentName, examTitle, percentage, passed), true);

            mailSender.send(message);
            log.info("Grading complete email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send grading complete email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildPasswordResetHtml(String userName, String token) {
        String resetUrl = appUrl + "/reset-password?token=" + token;
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 48px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🔐 ExamPlatform</h1>
                          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Plateforme d'examens en ligne</p>
                        </td></tr>
                        <!-- Body -->
                        <tr><td style="padding:48px;">
                          <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:22px;font-weight:700;">Bonjour, %s 👋</h2>
                          <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                            Nous avons reçu une demande de réinitialisation du mot de passe pour votre compte ExamPlatform.<br>
                            Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
                          </p>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                              Réinitialiser mon mot de passe
                            </a>
                          </div>
                          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.6;">
                            Ce lien est valable pendant <strong>1 heure</strong>. Si vous n'avez pas demandé de réinitialisation, ignorez cet email.
                          </p>
                        </td></tr>
                        <!-- Footer -->
                        <tr><td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2024 ExamPlatform — Tous droits réservés</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(userName, resetUrl);
    }

    private String buildWelcomeHtml(String userName, String role) {
        String roleLabel = switch (role) {
            case "ROLE_TEACHER" -> "Enseignant";
            case "ROLE_ADMIN" -> "Administrateur";
            default -> "Étudiant";
        };
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 48px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">🎓 Bienvenue !</h1>
                        </td></tr>
                        <tr><td style="padding:48px;">
                          <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:22px;font-weight:700;">Bonjour, %s !</h2>
                          <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                            Votre compte <strong>%s</strong> a été créé avec succès sur ExamPlatform.
                          </p>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
                              Accéder à ma plateforme
                            </a>
                          </div>
                        </td></tr>
                        <tr><td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2024 ExamPlatform</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(userName, roleLabel, appUrl);
    }

    private String buildGradingCompleteHtml(String studentName, String examTitle, double percentage, boolean passed) {
        String statusColor = passed ? "#16a34a" : "#dc2626";
        String statusText = passed ? "✅ Admis(e)" : "❌ Ajourné(e)";
        return """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
                    <tr><td align="center">
                      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                        <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 48px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">📋 Résultat disponible</h1>
                        </td></tr>
                        <tr><td style="padding:48px;">
                          <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:22px;font-weight:700;">Bonjour, %s !</h2>
                          <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
                            Votre examen <strong>"%s"</strong> vient d'être corrigé par votre enseignant.
                          </p>
                          <div style="text-align:center;margin:32px 0;padding:24px;background:#f9fafb;border-radius:12px;">
                            <p style="margin:0 0 8px;font-size:32px;font-weight:900;color:#1e1b4b;">%.1f%%</p>
                            <p style="margin:0;font-size:18px;font-weight:700;color:%s;">%s</p>
                          </div>
                          <div style="text-align:center;margin:32px 0;">
                            <a href="%s/student" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
                              Voir mon résultat complet
                            </a>
                          </div>
                        </td></tr>
                        <tr><td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;">© 2024 ExamPlatform</p>
                        </td></tr>
                      </table>
                    </td></tr>
                  </table>
                </body>
                </html>
                """.formatted(studentName, examTitle, percentage, statusColor, statusText, appUrl);
    }
}
