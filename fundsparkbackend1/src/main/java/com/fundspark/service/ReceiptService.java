package com.fundspark.service;

import com.fundspark.model.Donation;
import com.fundspark.model.Project;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Service
public class ReceiptService {

    public byte[] generateDonationReceipt(Donation donation) throws Exception {
        Project project = donation.getProject();

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, out);

        document.open();

        // Title
        Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
        Paragraph title = new Paragraph("Fundspark Donation Receipt", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Basic info
        Font normal = new Font(Font.HELVETICA, 12);
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
        String now = LocalDateTime.now().format(dtf);

        document.add(new Paragraph("Receipt ID: " + donation.getId(), normal));
        document.add(new Paragraph("Date: " + now, normal));
        document.add(new Paragraph(" ", normal));

        document.add(new Paragraph("Donor Name: " + donation.getDonorName(), normal));
        document.add(new Paragraph("Campaign: " + (project != null ? project.getTitle() : "N/A"), normal));
        document.add(new Paragraph("Amount: ₹" + donation.getAmount(), normal));
        document.add(new Paragraph(" ", normal));

        document.add(new Paragraph("Thank you for your generous support!", normal));
        document.add(new Paragraph("— Fundspark Team", normal));

        document.close();

        return out.toByteArray();
    }
}
