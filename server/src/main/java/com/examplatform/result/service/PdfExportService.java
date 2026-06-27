package com.examplatform.result.service;

import com.examplatform.result.entity.Result;
import com.examplatform.submission.entity.Submission;
import com.examplatform.user.entity.User;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class PdfExportService {

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private final ResultService resultService;

    @Transactional(readOnly = true)
    public byte[] generateResultPdf(Long id, String username) {
        Result result = resultService.getResultEntity(id, username);
        Submission submission = result.getSubmission();
        User student = submission.getStudent();
        var exam = submission.getExam();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // 1. Title Section
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Rapport de Résultat d'Examen", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(30);
            document.add(title);

            // 2. Info Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingAfter(30);

            addTableCell(table, "Étudiant :", student.getFirstName() + " " + student.getLastName());
            addTableCell(table, "Email :", student.getEmail());
            addTableCell(table, "Cours :", exam.getModule() != null ? exam.getModule().getName() : "N/A");
            addTableCell(table, "Examen :", exam.getTitle());
            addTableCell(table, "Date de passage :", submission.getSubmitTime() != null ?
                    submission.getSubmitTime().format(dateFormatter) : "Non soumis");
            addTableCell(table, "Score obtenu :", result.getScore() + " / " + exam.getTotalMarks());
            addTableCell(table, "Pourcentage :", String.format("%.2f %%", result.getPercentage()));
            addTableCell(table, "Questions Total :", String.valueOf(result.getTotalQuestions()));
            addTableCell(table, "Bonnes Réponses :", String.valueOf(result.getCorrectAnswers()));
            addTableCell(table, "Mauvaises Réponses :", String.valueOf(result.getWrongAnswers()));

            document.add(table);

            // 3. Status Section
            Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16,
                    result.isPassed() ? new Color(46, 125, 50) : new Color(198, 40, 40));
            Paragraph status = new Paragraph(result.isPassed() ? "STATUT : ADMIS (RÉUSSI)" : "STATUT : ÉCHEC", statusFont);
            status.setAlignment(Element.ALIGN_CENTER);
            status.setSpacingBefore(20);
            document.add(status);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Result PDF: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] generateCertificatePdf(Long id, String username) {
        Result result = resultService.getResultEntity(id, username);
        if (!result.isPassed()) {
            throw new IllegalArgumentException("Cannot generate completion certificate for a failed attempt");
        }

        Submission submission = result.getSubmission();
        User student = submission.getStudent();
        var exam = submission.getExam();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Landscape A4 for certificate
            Document document = new Document(PageSize.A4.rotate(), 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Decorative Border Table (single cell)
            PdfPTable borderTable = new PdfPTable(1);
            borderTable.setWidthPercentage(100);
            borderTable.setSpacingBefore(10);

            PdfPCell cell = new PdfPCell();
            cell.setBorder(Rectangle.BOX);
            cell.setBorderWidth(5);
            cell.setBorderColor(new Color(25, 118, 210)); // Sleek Blue border
            cell.setPadding(40);
            cell.setBackgroundColor(new Color(250, 250, 250));

            // Elements inside cell
            Paragraph certTitle = new Paragraph("CERTIFICAT DE RÉUSSITE",
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 32, new Color(25, 118, 210)));
            certTitle.setAlignment(Element.ALIGN_CENTER);
            certTitle.setSpacingAfter(20);
            cell.addElement(certTitle);

            Paragraph certSubtitle = new Paragraph("Décerné à",
                    FontFactory.getFont(FontFactory.HELVETICA, 16, Color.GRAY));
            certSubtitle.setAlignment(Element.ALIGN_CENTER);
            certSubtitle.setSpacingAfter(15);
            cell.addElement(certSubtitle);

            Paragraph studentName = new Paragraph(student.getFirstName().toUpperCase() + " " + student.getLastName().toUpperCase(),
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, Color.DARK_GRAY));
            studentName.setAlignment(Element.ALIGN_CENTER);
            studentName.setSpacingAfter(20);
            cell.addElement(studentName);

            Paragraph detailText = new Paragraph(
                    String.format("Pour avoir complété avec succès l'examen en ligne :\n\n\"%s\" (Cours: %s)\n\nle %s avec un score de %.2f%%.",
                            exam.getTitle(), exam.getModule() != null ? exam.getModule().getName() : "N/A",
                            submission.getSubmitTime() != null ? submission.getSubmitTime().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")) : "N/A",
                            result.getPercentage()),
                    FontFactory.getFont(FontFactory.HELVETICA, 14, Color.BLACK));
            detailText.setAlignment(Element.ALIGN_CENTER);
            detailText.setSpacingAfter(30);
            cell.addElement(detailText);

            Paragraph signatureLine = new Paragraph("Plateforme d'Examens en Ligne - Administration",
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 12, Color.GRAY));
            signatureLine.setAlignment(Element.ALIGN_CENTER);
            cell.addElement(signatureLine);

            borderTable.addCell(cell);
            document.add(borderTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Certificate PDF: " + e.getMessage(), e);
        }
    }

    private void addTableCell(PdfPTable table, String header, String val) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
        Font valFont = FontFactory.getFont(FontFactory.HELVETICA, 12, Color.BLACK);

        PdfPCell c1 = new PdfPCell(new Phrase(header, labelFont));
        c1.setBackgroundColor(new Color(240, 240, 240));
        c1.setPadding(8);
        c1.setBorder(Rectangle.BOX);

        PdfPCell c2 = new PdfPCell(new Phrase(val, valFont));
        c2.setPadding(8);
        c2.setBorder(Rectangle.BOX);

        table.addCell(c1);
        table.addCell(c2);
    }

    @Transactional(readOnly = true)
    public byte[] generateExamResultsPdf(Long examId, String username) {
        var results = resultService.getResultsByExamId(examId, username);
        if (results.isEmpty()) {
            throw new IllegalArgumentException("No results found for this exam");
        }

        var firstResult = results.get(0);
        var exam = firstResult.getSubmission().getExam();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 30, 30, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, Color.DARK_GRAY);
            Paragraph title = new Paragraph("Résultats d'Examen", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Paragraph subtitle = new Paragraph(exam.getTitle() + " - " + (exam.getModule() != null ? exam.getModule().getName() : "N/A"), FontFactory.getFont(FontFactory.HELVETICA, 14, Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(new float[]{1, 3, 2, 2, 2});
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"#", "Étudiant", "Score", "Pourcentage", "Statut"};
            for (String h : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(h, headerFont));
                headerCell.setBackgroundColor(new Color(25, 118, 210));
                headerCell.setPadding(6);
                table.addCell(headerCell);
            }

            Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            int idx = 1;
            for (Result r : results) {
                User student = r.getSubmission().getStudent();
                
                table.addCell(new PdfPCell(new Phrase(String.valueOf(idx++), rowFont)));
                table.addCell(new PdfPCell(new Phrase(student.getFirstName() + " " + student.getLastName(), rowFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(r.getScore()), rowFont)));
                table.addCell(new PdfPCell(new Phrase(String.format("%.2f%%", r.getPercentage()), rowFont)));
                
                Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, r.isPassed() ? new Color(46, 125, 50) : new Color(198, 40, 40));
                table.addCell(new PdfPCell(new Phrase(r.isPassed() ? "ADMIS" : "ÉCHEC", statusFont)));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Exam Results PDF: " + e.getMessage(), e);
        }
    }
}
