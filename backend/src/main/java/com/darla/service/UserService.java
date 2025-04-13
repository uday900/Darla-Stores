package com.darla.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import com.darla.dto.CartDto;
import com.darla.dto.OrderDto;
import com.darla.dto.OrderRequest;
import com.darla.dto.RazorPaymentResponse;
import com.darla.dto.RazorpayOrderResponseDto;
import com.darla.dto.RegisterDto;
import com.darla.dto.Response;
import com.darla.dto.UserDto;
import com.darla.entity.Cart;
import com.darla.entity.Order;
import com.darla.entity.Product;
import com.darla.entity.User;
import com.darla.exception_handling.NotFoundException;
import com.darla.repository.CartRepository;
import com.darla.repository.OrderRepository;
import com.darla.repository.ProductRepository;
import com.darla.repository.UserRepository;
import com.razorpay.RazorpayException;

import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;

@Service
public class UserService {

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private CartRepository cartRepository;

	@Autowired
	private ProductRepository productRepository;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private JavaMailSender javaMailSender;

	@Autowired
	private OrderRepository orderRepository;

	@Value("${frontend.url}")
	private String frontEndUrl;

	@Autowired
	private OtpService otpService;

	@Autowired
	private AuthenticationManager authenticationManager;

	private RazorPayService razorPayService;
	private EmailService emailService;

	UserService(RazorPayService razorPayService, EmailService emailService) {
		this.razorPayService = razorPayService;
		this.emailService = emailService;
	}

	// account deletion
	public Response deleteAccount(Long userId, String password) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("No Accound found with id " + userId));
		Response res = new Response();

		if (new BCryptPasswordEncoder(12).matches(password, user.getPassword())) {

			// delete all cart items
			List<Cart> cartItems = cartRepository.findByUser(userId);
			cartRepository.deleteAll(cartItems);

			// delete all orders
			List<Order> orders = orderRepository.findByUserId(userId);
			orderRepository.deleteAll(orders);

			// delete user
			userRepository.delete(user);
			res.setStatus(200);
			res.setMessage("Account deleted successfully");
		} else {
			res.setStatus(400);
			res.setMessage("Invalid credentials");
		}
		return res;
	}

	public Response login(String username, String password) {

		Optional<User> userOpt = userRepository.findByEmail(username);
		Response res = new Response();
		if (userOpt.isPresent()) {
			Authentication authentication = authenticationManager
					.authenticate(new UsernamePasswordAuthenticationToken(username, password));
			if (authentication.isAuthenticated()) {
				// set's the expiration time to 24 hours
				Long expirationTime = 24 * 60 * 60 * 1000L;
				String token = jwtService.generateToken(username, expirationTime);
				// sending the token and user info to the user
				User user = userOpt.get();
				UserDto userDto = UserDto.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
						.role(user.getRole()).city(user.getCity()).state(user.getState()).country(user.getCountry())
						.district(user.getDistrict()).street(user.getStreet()).createdAt(user.getCreatedAt())
						.phoneNumber(user.getPhoneNumber()).build();

				res.setStatus(200);
				res.setMessage("Logged in successful");
				res.setToken(token);
				res.setUser(userDto);
			} else {
				res.setStatus(401);
				res.setMessage("Invalid credentials");
			}
		} else {
			res.setStatus(404);
			res.setMessage("Account not found with " + username);
		}
		return res;
	}

	// fetch user details
	@Transactional
	public UserDto getUserInfo(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		return UserDto.builder().id(userId).name(user.getName()).email(user.getEmail())

		// only for testing
//				.password(user.getPassword())

				.role(user.getRole()).city(user.getCity()).state(user.getState()).country(user.getCountry())
				.district(user.getDistrict()).street(user.getStreet()).createdAt(user.getCreatedAt())
				.phoneNumber(user.getPhoneNumber())

				.build();
	}

	@Transactional
	public UserDto getUserInfo(OAuth2User userOauth) {
		String username = userOauth.getAttribute("email");
		Optional<User> user = userRepository.findByEmail(username);
		if (user.isEmpty())
			throw new NotFoundException("Account not found with " + username);

		return getUserInfo(user.get().getId());
	}

	public Response verifyOtpAndSetNewPassword(String email, String otp, String newPassword) {

		Response res = new Response();
		if (!otpService.isOtpValid(email, otp)) {
			res.setStatus(400);
			res.setMessage("Invalid OTP or expired OTP");
			return res;
		}

		// Check newPassword validations
		// regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits
		if (newPassword == null || newPassword.length() < 8 || !newPassword.matches(".*[A-Z].*")
				|| !newPassword.matches(".*[a-z].*") || !newPassword.matches(".*\\d.*")
				|| !newPassword.matches(".*[@$!%*?&].*")) {
			throw new RuntimeException("Password must be at least 8 characters long," + " contain an uppercase letter,"
					+ " a lowercase letter, a number, " + "and a special character.");
		}
		// Update the password
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new NotFoundException("No account found with " + email));
		user.setPassword(new BCryptPasswordEncoder(12).encode(newPassword));
		res.setStatus(200);
		res.setMessage("Password updated successfully");
		userRepository.save(user);

		return res;
	}

	public String sendOtpToEmail(String email) {
		String otp = otpService.generateOtp();
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new NotFoundException("No account found with " + email));

		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>OTP Verification</title>
				    <style>
				        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
				        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px;
				                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
				        h2 { color: #333; }
				        p { font-size: 16px; color: #555; }
				        .otp { font-size: 20px; font-weight: bold; color: #ff5722; }
				        .footer { margin-top: 20px; font-size: 14px; color: #888; }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <h2>OTP Verification Code</h2>
				        <p>Dear %s,</p>
				        <p>Your OTP Code: <span class="otp">%s</span></p>
				        <p>Use this One-Time Password (OTP) to verify your account. This OTP is valid for only <strong>5 minutes</strong>. Please do not share it with anyone.</p>
				        <p>If you did not request this OTP, please ignore this email.</p>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			"""
				.formatted(user.getName(), otp);
		// Store the OTP in Redis with a TTL of 5 minutes
		otpService.storeOtpInRedis(email, otp);
//		try {
//			MimeMessage message = javaMailSender.createMimeMessage();
//			MimeMessageHelper helper = new MimeMessageHelper(message, true);
//
//			helper.setTo(email);
//			helper.setSubject("OTP Verification Code");
//			helper.setText(htmlTemplate, true); // Set HTML content
//
//			javaMailSender.send(message);
//		} catch (Exception e) {
//			throw new RuntimeException("Failed to send email", e);
//		}

		// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(email, "OTP Verification Code", htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}

		return emailResponse;

	}

	// user registration
	public String registerUser(RegisterDto registerDto) {
		// checking user already exists
		Optional<User> existsUser = userRepository.findByEmail(registerDto.getEmail());
		if (existsUser.isPresent())
			throw new RuntimeException("User already exists with " + registerDto.getEmail());
		User user = User.builder().name(registerDto.getName()).email(registerDto.getEmail()).role("USER") // setting
																											// manually
				.password(new BCryptPasswordEncoder(12).encode(registerDto.getPassword()))

				.city(registerDto.getCity()).state(registerDto.getState()).country(registerDto.getCountry())
				.district(registerDto.getDistrict()).street(registerDto.getStreet())
				.phoneNumber(registerDto.getPhoneNumber()).createdAt(LocalDateTime.now())
				.zipCode(registerDto.getZipCode())

				.build();

		userRepository.save(user);

		return "User registration successfull";
	}

	// user profile update
	public String updateProfile(Long id, UserDto userDto) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new NotFoundException("User not found with id " + id));
		user.setName(userDto.getName());
		user.setEmail(userDto.getEmail());
		user.setCountry(userDto.getCountry());
		user.setDistrict(userDto.getDistrict());
		user.setPhoneNumber(userDto.getPhoneNumber());
		user.setCity(userDto.getCity());
		user.setStreet(userDto.getStreet());
		user.setZipCode(userDto.getZipCode());

		userRepository.save(user);

		return "Profile updated successfully";
	}

	/*
	 * Cart related functions
	 */
	// Add product to cart
	@Transactional
	public String addToCart(Long userId, Long productId) {

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new NotFoundException("Product not found with id " + productId));

		// checking if that product is present in user cart
		Optional<Cart> existItem = cartRepository.findProductByUserId(userId, productId);

		if (existItem.isPresent()) {
			// increment the quantity by 1
			Cart existedCart = existItem.get();
			existedCart.setQuantity(existedCart.getQuantity() + 1);

			cartRepository.save(existedCart);
			return "Product is already present in cart, incremented quantity";
		}

		Cart cart = Cart.builder().user(user).product(product).quantity(1).build();
		cartRepository.save(cart);
		return "Product successfully added to cart";
	}

	// remove from cart
	@Transactional
	public String removeFromCart(Long userId, Long cartId) {
		userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		Cart cart = cartRepository.findById(cartId)
				.orElseThrow(() -> new NotFoundException("cart not found with id " + cartId));

		cartRepository.delete(cart);

		return "Product removed from Cart successfully";
	}

	// increment quantity
	@Transactional
	public String incrementQuantity(Long userId, Long cartId) {
		userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		Cart cart = cartRepository.findById(cartId)
				.orElseThrow(() -> new NotFoundException("cart not found with id " + cartId));

		// check if the product is in stock
		Product product = cart.getProduct();
		if (product.getStock() < cart.getQuantity() + 1) {
			throw new RuntimeException("Product is out of stock");
		}
		cart.setQuantity(cart.getQuantity() + 1);
		cartRepository.save(cart);
		return "Item incremented quantity successfully";

	}

	// decrement quantity
	@Transactional
	public String decrementQuantity(Long userId, Long cartId) {
		userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		Cart cart = cartRepository.findById(cartId)
				.orElseThrow(() -> new NotFoundException("cart not found with id " + cartId));

		if (cart.getQuantity() == 1)
			return "Quantity can't be empty or less than zero";

		cart.setQuantity(cart.getQuantity() - 1);
		cartRepository.save(cart);
		return "Item decremented quantity successfully";

	}

	// fetch user cart
	@Transactional
	public List<CartDto> fetchUserCart(Long userId) {
		userRepository.findById(userId).orElseThrow(() -> new NotFoundException("User not found with id " + userId));

		List<Cart> cartItems = cartRepository.findByUser(userId);

		List<CartDto> cartItemsDto = cartItems.stream().map((item) -> {
			return CartDto.builder().id(item.getId()).userId(item.getUser().getId())
					.productName(item.getProduct().getName()).imageData(item.getProduct().getImageData())
					.brand(item.getProduct().getBrand()).price(item.getProduct().getPrice())
					.qunaitity(item.getQuantity()).build();
		}).toList();

		return cartItemsDto;
	}

	/*
	 * order details
	 *
	 * 
	 */

	// place order with razorpay
	@Transactional
	public Response placeOrderWithRazorPay(OrderRequest orderRequest) {
		// proceed with the order
		/*
		 * orderRequest has - userId - productId - quantity - paymentMethod
		 * 
		 */

		Response res = new Response();
		// check if user exists
		User user = userRepository.findById(orderRequest.getUserId())
				.orElseThrow(() -> new NotFoundException("User not found with id " + orderRequest.getUserId()));
		// check if product exists
		Product product = productRepository.findById(orderRequest.getProductId())
				.orElseThrow(() -> new NotFoundException("Product not found with id " + orderRequest.getProductId()));

		// check if product is in stock
		if (product.getStock() <= 0)
			throw new RuntimeException("Product is out of stock");
		if (product.getStock() < orderRequest.getQuantity()) {
			throw new RuntimeException(String.format("Only %d stock is available for the product %s",
					product.getStock(), product.getName()));
		}
		Order newOrder = Order.builder().user(user).product(product).quantity(orderRequest.getQuantity())
				.totalAmount(orderRequest.getQuantity() * product.getPrice()).createdAt(LocalDateTime.now())
				.status("PENDING")
				.paymentStatus("PENDING")
				.shippingAddress(orderRequest.getShippingAddress())
				.build();
		// check payment method
		if (!orderRequest.getPaymentMode().toLowerCase().equals("razorpay")) {
			// proceed with cash on delivery
			newOrder.setPaymentMethod("CASH_ON_DELIVERY");
			newOrder.setStatus("CONFIRMED");

			// reduce stock
			product.setStock(product.getStock() - orderRequest.getQuantity());
			productRepository.save(product);
			res.setMessage("Order placed successfully");

		} else {
			// proceed with razorpay
			newOrder.setPaymentMethod("RAZORPAY");
//			newOrder.setPaymentStatus("PENDING");
			// create order in razorpay
			// send receipt as user id
			try {
				RazorpayOrderResponseDto razorPayResponse = razorPayService.createOrder(
						orderRequest.getQuantity() * product.getPrice(), "INR", orderRequest.getUserId().toString());

				newOrder.setRazorpayOrderId(razorPayResponse.getId());

				res.setRazorpayOrder(razorPayResponse); // Now a simple DTO, not a complex Razorpay object

			} catch (RazorpayException e) {
				throw new RuntimeException("Failed to create order with razorpay", e);
			}
		}

		// save order in database
		orderRepository.save(newOrder);

		res.setStatus(200);

		return res;
	}

	/*
	 * checkout with razorpay recieves user Id we need to fetch all cart items
	 * 
	 */
	@Transactional
	public Response checkOutWithRazorPay(Long userId, String paymentMethod, String shippingAddress) {
		Response res = new Response();
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		List<Cart> cartItems = cartRepository.findByUser(userId);

		if (cartItems.isEmpty()) {
			res.setStatus(404);
			res.setMessage("No items in cart");
			return res;
		}

		Double totalAmount = 0.0;
		for (Cart cart : cartItems) {
			totalAmount += cart.getProduct().getPrice() * cart.getQuantity();
		}

		if (!paymentMethod.toLowerCase().equals("razorpay")) {
			// proceed with cash on delivery
			for (Cart item : cartItems) {
				Order order = Order.builder().user(user).product(item.getProduct()).quantity(item.getQuantity())
						.totalAmount(item.getProduct().getPrice() * item.getQuantity()).createdAt(LocalDateTime.now())
						.status("CONFIRMED").paymentMethod("CASH_ON_DELIVERY").paymentStatus("PENDING")
						.shippingAddress(shippingAddress).build();
				orderRepository.save(order);

				cartRepository.delete(item); // remove item from cart
			}
			res.setStatus(200);
			res.setMessage("Order placed successfully");
			return res;
		}

		RazorpayOrderResponseDto razorPayResponse;
		try {
			razorPayResponse = razorPayService.createOrder(totalAmount, "INR", userId.toString());

			res.setRazorpayOrder(razorPayResponse);
			res.setStatus(200);

			for (Cart item : cartItems) {
				Order order = Order.builder().user(user).product(item.getProduct()).quantity(item.getQuantity())
						.totalAmount(item.getProduct().getPrice() * item.getQuantity()).createdAt(LocalDateTime.now())
						.status("PENDING").paymentMethod("RAZORPAY").paymentStatus("PENDING")
						.razorpayOrderId(razorPayResponse.getId()).shippingAddress(shippingAddress).build();
				orderRepository.save(order);
//                cartRepository.delete(item); // remove item from cart
			}
		} catch (RazorpayException e) {
			throw new RuntimeException("Failed to create order with razorpay", e);
		}

		return res;
	}

	// verify order with razorpay
	@Transactional
	public Response verifyOrderWithRazorPay(RazorPaymentResponse razorPaymentResponse) {
		Response res = new Response();

		boolean isValid = razorPayService.verifySignature(razorPaymentResponse.getRazorpay_order_id(),
				razorPaymentResponse.getRazorpay_payment_id(), razorPaymentResponse.getRazorpay_signature());

		List<Order> orders = orderRepository.findByRazorpayOrderId(razorPaymentResponse.getRazorpay_order_id());
		if (!isValid) {

			// update all orders with that razorpay order id
			for (Order order : orders) {
				order.setPaymentStatus("FAILED");
				order.setStatus("PENDING");
				orderRepository.save(order);
			}
			res.setStatus(400);
			res.setMessage("Payment verification failed!");
			return res;
		} else {
			// update all orders with that razorpay order id
			for (Order order : orders) {
				order.setPaymentId(razorPaymentResponse.getRazorpay_payment_id());
				order.setPaymentStatus("COMPLETED");
				order.setStatus("CONFIRMED");

				// reduce stock
				Product product = order.getProduct();
				product.setStock(product.getStock() - order.getQuantity());
				productRepository.save(product);

				orderRepository.save(order);
			}
			
			// proceed to delete cart items in-case of check out
			if (orders.size() > 1) {
				Long userId = orders.get(0).getUser().getId();
				// remove item from cart
				List<Cart> cartItem = cartRepository.findByUser(userId);
				
				for (Cart item : cartItem) {
					cartRepository.delete(item);
				}
			}
			res.setStatus(200);
			res.setMessage("Payment Successfully done and orders confirmed successfully!");
		}
		return res;
	}

	// payment failure
	@Transactional
	public Response paymentFailure(String razorpayOrderId) {
		Response res = new Response();
		List<Order> order = orderRepository.findByRazorpayOrderId(razorpayOrderId);
		if (!order.isEmpty()) {
//			Order existingOrder = order.get();
			// update order status to failed and cancel the order
			for (Order existingOrder : order) {
				// update order status to failed and cancel the order
//				existingOrder.setPaymentStatus("FAILED");
//				existingOrder.setStatus("CANCELED");
//				orderRepository.save(existingOrder);
				
				
				/*
				 * Delete order 
				 * 
				 */
				orderRepository.delete(existingOrder);
			}

			res.setStatus(400);
			res.setMessage("Payment failed, order canceled successfully!");
		} else {
			res.setStatus(404);
			res.setMessage("Order not found!");
		}
		return res;
	}

	// place order old
	@Transactional
	public String placeOrder(Long userId, Long productId, Integer quantity) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + productId));
		if (product.getStock() <= 0)
			throw new RuntimeException("Product is out of stock");

		if (product.getStock() < quantity) {
			throw new RuntimeException(String.format("Only %d stock is available for the product %s",
					product.getStock(), product.getName()));
		}

		Order newOrder = Order.builder().user(user).product(product).quantity(quantity)
				.totalAmount(quantity * product.getPrice()).createdAt(LocalDateTime.now()).status("PENDING").build();

		orderRepository.save(newOrder);

		// reduce stock
		product.setStock(product.getStock() - quantity);
		productRepository.save(product);

		// send email, with order details like order id, product name, quantity, total
		// amount
		String email = user.getEmail();
		String subject = "Order Confirmation";
		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>Order Confirmation</title>
				    <style>
				        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
				        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px;
				                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
				        h2 { color: #333; }
				        p { font-size: 16px; color: #555; }
				        .order-details { margin-top: 20px; }
				        .footer { margin-top: 20px; font-size: 14px; color: #888; }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <h2>Order Confirmation</h2>
				        <p>Dear %s,</p>
				        <p>Your order has been successfully placed!</p>

				        <div class="order-details">
				            <p><strong>Order ID:</strong> %d</p>
				            <p><strong>Product Name:</strong> %s</p>
				            <p><strong>Quantity:</strong> %d</p>
				            <p><strong>Total Amount:</strong> $%.2f</p>
				        </div>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(user.getName(), newOrder.getId(), product.getName(), quantity,
				newOrder.getTotalAmount());
		// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(email, subject, htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}
		// Log the email response
		System.out.println("Email sent: " + emailResponse);
		// Log the order details
		System.out.println("Order ID: " + newOrder.getId());
		System.out.println("User ID: " + user.getId());

		// add to activity logs
		ActivityLogs.addEntry("Order placed with id " + newOrder.getId());

		return "Order placed";
	}

	public Response updateOrder(Long orderId, String status) {
		
		Response res = new Response();
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new NotFoundException("order not found or not exists"));
		
		// check if the order is refund initiated or not
		if (order.getStatus().equals("REFUND_ISSUED")) {
			throw new RuntimeException("Order must be refunded first");
		}
		
		
		// check if the status is delivered,
		// if the order is not paid
		if (!order.getPaymentStatus().equals("COMPLETED") && status.equals("DELIVERED")) {
			throw new RuntimeException("payment is not done yet for this order");
		}
		// check if the order delivered or not
				if (order.getStatus().equals("DELIVERED") || order.getStatus().equals("CANCELED")) {
					throw new RuntimeException("Order has been delivered or canceled");
				}
				
				
		// change payment status to paid, if the order is paid in case of cash on delivery
		if (
				order.getPaymentMethod().equals("CASH_ON_DELIVERY") &&
				status.equals("COMPLETED") && !order.getPaymentStatus().equals("COMPLETED")) {
			order.setPaymentStatus("COMPLETED");
			order.setStatus("DELIVERED");
			orderRepository.save(order);
			res.setStatus(200);
			res.setMessage("Order status updated successfully");
			return res;
		}
		
		if (status.equals("COMPLETED") && order.getPaymentStatus().equals("COMPLETED")) {
			throw new RuntimeException("Order already completed");
		}
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));

		// check if the request comes from user with only cancel order
		if (!isAdmin && !status.equals("CANCELED")) {
			throw new RuntimeException("You are not allowed to update order status");
		}
		
		// check user pay the amount or not
		if (status.equals("CANCELED") && (order.getPaymentId() == null || order.getPaymentId().isEmpty())) {
			// proceed to cancel order
			order.setStatus(status.toUpperCase());
			order.setPaymentStatus("CANCELED");
			orderRepository.save(order);
	        ActivityLogs.addEntry("Order canceled without payment: Order ID " + orderId);
	        
	        res.setStatus(200);
	        res.setMessage("Order canceled successfully");
	        
	        return res;		
	      
//			return "Your order has been cancelled successfully";
		}
		
		if (status.equals("CANCELED")) {
			order.setStatus("REFUND_ISSUED");
			order.setPaymentStatus("REFUND_INITIATED");
			
			orderRepository.save(order);
			ActivityLogs.addEntry("Order status updated with id " + orderId);
			
			res.setStatus(200);
			res.setMessage("Order status updated successfully");
			
			return res;

//			return String.format("Order with id %d status updated successfully", orderId);
		}
		
		// handle payment refund here
		
		 order.setStatus(status);
		 orderRepository.save(order);
		
		// add to activity logs
		ActivityLogs.addEntry("Order status updated with id " + orderId);

		res.setStatus(200);
		res.setMessage("Order status updated successfully");
//		return String.format("Order with id %d status updated successfully", orderId)
		return res;
	}
	
	// issue refund
	public String issueRefundByAdmin(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if ("REFUNDED".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new RuntimeException("Order already refunded");
        }

        String paymentId = order.getPaymentId();
        if (paymentId == null || paymentId.trim().isEmpty()) {
            throw new RuntimeException("Payment not found for this order");
        }

        try {
            Double refundAmountInPaise = order.getTotalAmount() * 100; // Razorpay needs amount in paise

            // Call Razorpay refund
            String refundResponse = razorPayService.issueRefund(paymentId, refundAmountInPaise);

            // Update order status
            order.setStatus("CANCELED");
            order.setPaymentStatus("REFUNDED");
            orderRepository.save(order);

            // Log it
//            ActivityLogs.addEntry("Refund issued for Order ID: " + orderId + ", Payment ID: " + paymentId);\
            ActivityLogs.addEntry("Partial refund of ₹" + order.getTotalAmount() +
                    " issued for Order ID: " + orderId + ", Payment ID: " + paymentId);
            return "Refund successful for order ID: " + orderId;

        } catch (Exception e) {
            e.printStackTrace();
            return "Refund failed: " + e.getMessage();
        }
        
//        return "Refund failed";
    }
	

	public List<OrderDto> fetchAllOrders() {
		List<Order> orders = orderRepository.findAll();
		List<OrderDto> ordersDto = orders.stream()

				.map((order) -> OrderDto.builder().id(order.getId()).userId(order.getUser().getId())
						.productName(order.getProduct().getName()).productId(order.getProduct().getId())
						.quantity(order.getQuantity()).totalAmount(order.getTotalAmount())
						.createdAt(order.getCreatedAt()).status(order.getStatus())
						.paymentMethod(order.getPaymentMethod()).paymentStatus(order.getPaymentStatus())
						.shippingAddress(order.getShippingAddress()).paymentId(order.getPaymentId())

						.build())
				.toList();
		return ordersDto;
	}

	@Transactional
	public List<OrderDto> fetchOrdersByUser(Long userId) {

		List<Order> orders = orderRepository.findByUserId(userId);
//		if (orders.isEmpty())
//			throw new NotFoundException("No orders found with user id " + userId);
		List<OrderDto> ordersDto = orders.stream()

				.map((order) -> OrderDto.builder().id(order.getId()).userId(order.getUser().getId())
						.productName(order.getProduct().getName()).productId(order.getProduct().getId())
						.quantity(order.getQuantity()).totalAmount(order.getTotalAmount())
						.createdAt(order.getCreatedAt()).status(order.getStatus())
						.paymentMethod(order.getPaymentMethod()).paymentStatus(order.getPaymentStatus())
						.shippingAddress(order.getShippingAddress())
//						.razorpayOrderId(order.getRazorpayOrderId())
						.paymentId(order.getPaymentId())
						.imageData(order.getProduct().getImageData())

						.build())
				.toList();
		return ordersDto;
	}

	@Transactional
	public String checkOut(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
		List<Cart> cartItems = cartRepository.findByUser(userId);

		cartItems.forEach((item) -> {

			if (item.getProduct().getStock() < item.getQuantity()) {
				throw new RuntimeException(String.format("Only %d stock is available for the product %s",
						item.getProduct().getStock(), item.getProduct().getName()));
			}

			Order order = Order.builder().user(user).product(item.getProduct()).quantity(item.getQuantity())
					.totalAmount(item.getQuantity() * item.getProduct().getPrice()).status("PENDING")
					.createdAt(LocalDateTime.now())

					.build();

			orderRepository.save(order);

			// reduce stock
			Product product = item.getProduct();
			product.setStock(product.getStock() - item.getQuantity());
			productRepository.save(product);

		});
		// Add to activity logs
		ActivityLogs.addEntry("Order placed with user %d cart items".formatted(userId));

		// remove items from cart
		cartRepository.deleteAll(cartItems);

		

		return "Orders placed with your cart items";
	}

	public Response updatePassword(Long userId, String oldPassword, String newPassword) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));

		if (user.getPassword().isEmpty())
			throw new RuntimeException("You have not set password yet!");
		Response res = new Response();
//		new BCryptPasswordEncoder(12).encode(registerDto.getPassword())

		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

//		String encodedPassword = new BCryptPasswordEncoder(12).encode(oldPassword);
//		System.out.println(encodedPassword.equals(user.getPassword()));	

		if (encoder.matches(oldPassword, user.getPassword())) {
			user.setPassword(new BCryptPasswordEncoder(12).encode(newPassword));
			res.setStatus(200);
			res.setMessage("Password updated Successfully");
			userRepository.save(user);
		} else {
			res.setMessage("Wrong Password!");
			res.setStatus(400);
		}

		// send email to user, with password updated successfully
		String email = user.getEmail();
		String subject = "Your Password has been updated";
		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>Password Update Confirmation</title>
				    <style>
				        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
				        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px;
				                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
				        h2 { color: #333; }
				        p { font-size: 16px; color: #555; }
				        .footer { margin-top: 20px; font-size: 14px; color: #888; }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <h2>Password Update Confirmation</h2>
				        <p>Dear %s,</p>
				        <p>Your password has been successfully updated!</p>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(user.getName());
		// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(email, subject, htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}
		// Log the email response
		System.out.println("Email sent: " + emailResponse);

		return res;
	}

	public String setNewPassword(String token, String newPassword) {

		String username = jwtService.extractUserName(token);
		Optional<User> userOpt = userRepository.findByEmail(username);

		System.out.println(username);
		System.out.println(userOpt.get());
		System.out.println(jwtService.isValidToken(userOpt.get(), token));

		if (username == null || userOpt.isEmpty() || !jwtService.isValidToken(userOpt.get(), token))
			throw new RuntimeException("Link expired! Please re-send link");

		User user = userOpt.get();
		user.setPassword(new BCryptPasswordEncoder(12).encode(newPassword));

		userRepository.save(user);

		// send email to user, with password updated successfully
		String email = user.getEmail();
		String subject = "Your Password has been updated";
		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>Password Update Confirmation</title>
				    <style>
				        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
				        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px;
				                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
				        h2 { color: #333; }
				        p { font-size: 16px; color: #555; }
				        .footer { margin-top: 20px; font-size: 14px; color: #888; }
				    </style>
				</head>
				<body>
				    <div class="container">
				        <h2>Password Update Confirmation</h2>
				        <p>Dear %s,</p>
				        <p>Your password has been successfully updated!</p>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(user.getName());
		// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(email, subject, htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}
		// Log the email response
		System.out.println("Email sent: " + emailResponse);

		return "Password changed successfully";
	}

	public Response verifyJwtToken(String token) {
		Response res = new Response();
		String username = jwtService.extractUserName(token);
		Optional<User> userOpt = userRepository.findByEmail(username);

		if (userOpt.isEmpty() || !jwtService.isValidToken(userOpt.get(), token)) {
			throw new NotFoundException("Session expired! Please Login again");
		}
		User user = userOpt.get();
		UserDto userDto = UserDto.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
				.role(user.getRole()).city(user.getCity()).state(user.getState()).country(user.getCountry())
				.district(user.getDistrict()).street(user.getStreet()).createdAt(user.getCreatedAt())
				.phoneNumber(user.getPhoneNumber()).build();
		res.setUser(userDto);
		res.setStatus(200);
		res.setMessage("Logged in successfully");
		return res;
	}

	public Response oauthCallback(OAuth2User userOauth, String mode) {
		String email = userOauth.getAttribute("email");

		Optional<User> userOpt = userRepository.findByEmail(email);

		if (mode.equals("login")) {
			// Login flow
			if (userOpt.isPresent()) {
				User user = userOpt.get();
				// set's the expiration time to 24 hours
				Long expirationTime = 24 * 60 * 60 * 1000L;
				String token = jwtService.generateToken(email, expirationTime);
				// sending the token and user info to the user
				UserDto userDto = UserDto.builder().id(user.getId()).name(user.getName()).email(user.getEmail())
						.role(user.getRole()).city(user.getCity()).state(user.getState()).country(user.getCountry())
						.district(user.getDistrict()).street(user.getStreet()).createdAt(user.getCreatedAt())
						.phoneNumber(user.getPhoneNumber()).build();
				Response response = new Response();
				response.setStatus(200);
				response.setMessage("Login successful");
				response.setToken(token);
				response.setUser(userDto);
				return response;

			} else {
				throw new NotFoundException("Account not found with " + email);
			}

		} else {
			// registeraion flow
			if (userOpt.isEmpty()) {
				User user = new User();
				user.setName(userOauth.getAttribute("name"));
				user.setEmail(email);
				user.setRole("USER");
				user.setCreatedAt(LocalDateTime.now());

				userRepository.save(user);
				Response response = new Response();
				response.setStatus(201);
				response.setMessage("Registration successful");
				return response;
			} else {
				throw new RuntimeException("Account already exists with " + email);
			}
		}
	}

	public List<UserDto> fetchAllUsers() {

		List<User> users = userRepository.findAll();
		List<UserDto> usersDto = users.stream().map((user) -> {
			return UserDto.builder().id(user.getId()).name(user.getName()).email(user.getEmail()).role(user.getRole())
					.city(user.getCity()).state(user.getState()).country(user.getCountry()).district(user.getDistrict())
					.street(user.getStreet()).createdAt(user.getCreatedAt()).phoneNumber(user.getPhoneNumber()).build();
		}).toList();

		return usersDto;
	}

}
