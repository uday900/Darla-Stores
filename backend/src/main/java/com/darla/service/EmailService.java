package com.darla.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
	
	@Autowired
	private JavaMailSender javaMailSender;
	
	public String sendEmailWithHtmlTemplate(String to, String subject, String htmlContent) throws MessagingException {
		// Create a MimeMessage
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        try {
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // Set to true to send HTML content
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Error while sending email: " + e.getMessage();
        }
        return "An Email sent Successfully" + to;
	}

}
