package com.darla.service;

import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.darla.dto.RazorpayOrderResponseDto;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;

@Service
public class RazorPayService {

	@Value("${razorpay.api.key}")
	private String razorpayApiKey;

	@Value("${razorpay.api.secret}")
	private String razorpayApiSecret;
	
	 // Refund API
	public String issueRefund(String paymentId, Double amountInPaise) throws RazorpayException {
	    RazorpayClient razorpay = new RazorpayClient(razorpayApiKey, razorpayApiSecret);

	    JSONObject refundRequest = new JSONObject();
	    refundRequest.put("payment_id", paymentId);
	    
	    // Razorpay expects amount as Integer (in paise)
	    if (amountInPaise != null) {
	        refundRequest.put("amount", amountInPaise.intValue());
	    }

	    Refund refund = razorpay.payments.refund(refundRequest);

	    return refund.toString(); // Or return refund.get("id") if needed
	}


	public boolean verifySignature(String orderId, String paymentId, String signature) {
	    try {
	        String payload = orderId + "|" + paymentId;

	        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
	        SecretKeySpec secretKey = new SecretKeySpec(razorpayApiSecret.getBytes(), "HmacSHA256");
	        sha256HMAC.init(secretKey);

	        byte[] hash = sha256HMAC.doFinal(payload.getBytes());
	        String expectedSignature = bytesToHex(hash);

	        return expectedSignature.equals(signature);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return false;
	    }
	}

	private String bytesToHex(byte[] hash) {
	    StringBuilder hexString = new StringBuilder();
	    for (byte b : hash) {
	        String hex = Integer.toHexString(0xff & b);
	        if (hex.length() == 1) hexString.append('0');
	        hexString.append(hex);
	    }
	    return hexString.toString();
	}


	

	/*
	 * creating order with amount, currency, receipt
	 */

	public RazorpayOrderResponseDto createOrder(Double amount, String currency, String receipt) throws RazorpayException {
	    RazorpayClient razorpayClient = new RazorpayClient(razorpayApiKey, razorpayApiSecret);

	    JSONObject orderRequest = new JSONObject();
	    orderRequest.put("amount", amount * 100); // in paise
	    orderRequest.put("currency", currency);
	    orderRequest.put("receipt", receipt);

	    Order order = razorpayClient.orders.create(orderRequest);

	    return RazorpayOrderResponseDto.builder()
	            .id(order.get("id"))
	            .currency(order.get("currency"))
	            .amount(order.get("amount"))
	            .build();
	}

	

}
