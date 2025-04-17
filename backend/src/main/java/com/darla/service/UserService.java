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
import com.darla.entity.Review;
import com.darla.entity.User;
import com.darla.exception_handling.NotFoundException;
import com.darla.mapper.Mapper;
import com.darla.repository.CartRepository;
import com.darla.repository.OrderRepository;
import com.darla.repository.ProductRepository;
import com.darla.repository.ReviewRepository;
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
	private OrderRepository orderRepository;

	@Value("${frontend.url}")
	private String frontEndUrl;

	@Autowired
	private OtpService otpService;

	@Autowired
	private AuthenticationManager authenticationManager;

	private RazorPayService razorPayService;
	private EmailService emailService;
	private ReviewRepository reviewRepository;

	UserService(
			RazorPayService razorPayService,
			ReviewRepository reviewRepository,
			EmailService emailService) {
		this.razorPayService = razorPayService;
		this.emailService = emailService;
		this.reviewRepository = reviewRepository;
	}

	// account deletion
	@Transactional
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
			
			// delete all reviews
			List<Review> reviews = reviewRepository.findByUserId(userId);
			reviewRepository.deleteAll(reviews);

			// delete user
			userRepository.delete(user);
			res.setStatus(200);
			res.setMessage("Your Account deleted successfully");
			
			// Add to activity logs
			ActivityLogs.addEntry("User account deleted with id " + userId);
			
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
				

//				System.out.println("User logged in: " + user.getZipCode());
				res.setStatus(200);
				res.setMessage("Logged in successful");
				res.setToken(token);
				res.setUser(Mapper.mapToUserDto(user));
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
		return Mapper.mapToUserDto(user);
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
		user.setState(userDto.getState());

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
			throw new RuntimeException(
					"Only " + product.getStock() + " stock is available for the product " + product.getName());
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
					.quantity(item.getQuantity()).build();
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
				.status("PENDING").paymentStatus("PENDING").shippingAddress(orderRequest.getShippingAddress()).build();
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


		// logs to activity
		ActivityLogs.addEntry("A new order placed an order with ID: " + newOrder.getId());
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
		} else {
			// check if all items are in stock
			for (Cart cart : cartItems) {
				Product product = cart.getProduct();
				if (product.getStock() <= 0)
					throw new RuntimeException("Product is out of stock");
				if (product.getStock() < cart.getQuantity()) {
					throw new RuntimeException(String.format("Only %d stock is available for the product %s",
							product.getStock(), product.getName()));
				}
			}	
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
			
			// Add to activity logs
			ActivityLogs.addEntry("A new order placed an order with ID: " + cartItems.get(0).getId());
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
		
		// Add to activity logs
		ActivityLogs.addEntry("Payment successfully done for order with ID: " + orders.get(0).getId());
		
		// send email to user
		String email = orders.get(0).getUser().getEmail();	
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
				            <p><strong>Total Amount:</strong> $%.2f</p>
				        </div>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(orders.get(0).getUser().getName(), orders.get(0).getId(),
				orders.get(0).getTotalAmount());
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

//	// place order old
//	@Transactional
//	public String placeOrder(Long userId, Long productId, Integer quantity) {
//		User user = userRepository.findById(userId)
//				.orElseThrow(() -> new NotFoundException("User not found with id " + userId));
//		Product product = productRepository.findById(productId)
//				.orElseThrow(() -> new NotFoundException("User not found with id " + productId));
//		if (product.getStock() <= 0)
//			throw new RuntimeException("Product is out of stock");
//
//		if (product.getStock() < quantity) {
//			throw new RuntimeException(String.format("Only %d stock is available for the product %s",
//					product.getStock(), product.getName()));
//		}
//
//		Order newOrder = Order.builder().user(user).product(product).quantity(quantity)
//				.totalAmount(quantity * product.getPrice()).createdAt(LocalDateTime.now()).status("PENDING").build();
//
//		orderRepository.save(newOrder);
//
//		// reduce stock
//		product.setStock(product.getStock() - quantity);
//		productRepository.save(product);
//
//		// send email, with order details like order id, product name, quantity, total
//		// amount
//		String email = user.getEmail();
//		String subject = "Order Confirmation";
//		String htmlTemplate = """
//				    			<!DOCTYPE html>
//				<html>
//				<head>
//				    <meta charset="UTF-8">
//				    <title>Order Confirmation</title>
//				    <style>
//				        body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
//				        .container { max-width: 600px; background-color: #ffffff; padding: 20px; border-radius: 8px;
//				                    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); }
//				        h2 { color: #333; }
//				        p { font-size: 16px; color: #555; }
//				        .order-details { margin-top: 20px; }
//				        .footer { margin-top: 20px; font-size: 14px; color: #888; }
//				    </style>
//				</head>
//				<body>
//				    <div class="container">
//				        <h2>Order Confirmation</h2>
//				        <p>Dear %s,</p>
//				        <p>Your order has been successfully placed!</p>
//
//				        <div class="order-details">
//				            <p><strong>Order ID:</strong> %d</p>
//				            <p><strong>Product Name:</strong> %s</p>
//				            <p><strong>Quantity:</strong> %d</p>
//				            <p><strong>Total Amount:</strong> $%.2f</p>
//				        </div>
//
//				        <div class="footer">
//				            <p>Best Regards,<br>Darla Store</p>
//				        </div>
//				    </div>
//				</body>
//				</html>
//
//				    			""".formatted(user.getName(), newOrder.getId(), product.getName(), quantity,
//				newOrder.getTotalAmount());
//		// Send the email using the EmailService
//		String emailResponse;
//		try {
//			emailResponse = emailService.sendEmailWithHtmlTemplate(email, subject, htmlTemplate);
//		} catch (Exception e) {
//			throw new RuntimeException("Failed to send email", e);
//		}
//		// Log the email response
//		System.out.println("Email sent: " + emailResponse);
//		// Log the order details
//		System.out.println("Order ID: " + newOrder.getId());
//		System.out.println("User ID: " + user.getId());
//
//		// add to activity logs
//		ActivityLogs.addEntry("Order placed with id " + newOrder.getId());
//
//		return "Order placed";
//	}
//
	public Response updateOrder(Long orderId, String status) {

		
		Response res = new Response();
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new NotFoundException("order not found or not exists"));
		
		/*
		 * check if the order is delivered or
		 * refund issued or canceled
		 * then throw exception
		 */
		if ( order.getStatus().equals("DELIVERED") ||
				order.getStatus().equals("REFUND_ISSUED") ||
				order.getStatus().equals("CANCELED")) {
			throw new RuntimeException("You are not allowed to update the order. It may be delivered or canceled or issued refund");
		}
		
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		boolean isAdmin = auth.getAuthorities().stream().anyMatch(role -> role.getAuthority().equals("ROLE_ADMIN"));
		
		/*
		 * check if the person is user
		 * then he can only cancel the order
		 * if the order is not delivered, then he can cancel the order
		 * if the order is delivered, then he can not cancel the order
		 * if amount is not paid, simply cancel the order
		 * if amount is paid, then issue refund
		 * 
		 */
		if (!isAdmin) {
			if (!status.equals("CANCELED")) {
				throw new RuntimeException("You are not allowed to update order status");
			}
			// check if the payment is done or not
			if (order.getPaymentStatus().equals("COMPLETED")) {
				// issue refund
				order.setStatus("REFUND_ISSUED");
				order.setPaymentStatus("REFUND_INITIATED");
				orderRepository.save(order);
				ActivityLogs.addEntry("Order status updated with id " + orderId);
				
			} else {
				// proceed to cancel order
				order.setStatus(status.toUpperCase());
				
				// set the product stock to the original stock
				Product product = order.getProduct();
				product.setStock(product.getStock() + order.getQuantity());
				productRepository.save(product);
				orderRepository.save(order);
				
				
				ActivityLogs.addEntry("Order canceled without payment: Order ID " + orderId);
			}
			
			res.setStatus(200);
			res.setMessage("Order canceled successfully");
			
			// send email to user
			sendOrderUpdateMail(orderId, status);
			

			return res;
		}
		// restrict canceling order for admin
		if (status.equals("CANCELED")) {
			throw new RuntimeException("You are not allowed to cancel the order");
		}


		/*
		 * incoming status is delivered
		 * if the order is not paid
		 * then throw exception
		 * if the order is paid
		 * then update the order status to delivered
		 * 
		 */
		if (status.equals("DELIVERED")) {
			// check if the payment is done or not
			if (order.getPaymentStatus().equals("COMPLETED")) {
				// update order status to delivered
				order.setStatus(status);
				orderRepository.save(order);
				
			} else {
				// throw exception
				throw new RuntimeException("Payment is not done yet for this order");
			}
			
			res.setStatus(200);
			res.setMessage("Order status updated successfully");
			
			// send email to user
			sendOrderUpdateMail(orderId, status);
			// add to activity logs
			ActivityLogs.addEntry("Order status updated with id " + orderId);
			return res;
		}
	

		/*
		 * If the status is completed
		 * it is only for cash on delivery
		 */
		if (status.equals("COMPLETED")) {
			// check the payment method
			if (order.getPaymentMethod().equals("CASH_ON_DELIVERY") && 
					!order.getPaymentStatus().equals("COMPLETED")) {
				// update order status to delivered
				order.setStatus("DELIVERED");
				order.setPaymentStatus("COMPLETED");
				orderRepository.save(order);
				res.setStatus(200);
				res.setMessage("Order status updated successfully");
				
				// send email to user
				sendOrderUpdateMail(orderId, status);
				// add to activity logs
				ActivityLogs.addEntry("Order status updated with id " + orderId);
				
				return res;
			} else {
				throw new RuntimeException("You are not allowed to update order status to " + status);
			}
			
		}
	


		order.setStatus(status);
		orderRepository.save(order);

		// add to activity logs
		ActivityLogs.addEntry("Order status updated with id " + orderId);

		res.setStatus(200);
		res.setMessage("Order status updated successfully");
		
		// send email to user
		sendOrderUpdateMail(orderId, status);
		
		
		return res;
	}
	
	// send mail to user order status update
	public void sendOrderUpdateMail(Long orderId, String status) {
		
		Order order = orderRepository.findById(orderId)
				.orElseThrow(() -> new NotFoundException("order not found or not exists"));
		// creating email template
		
		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>Order Status Update</title>
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
				        <h2>Order Status Update</h2>
				        <p>Dear %s,</p>
				        <p>Your order status has been updated!</p>

				        <div class="order-details">
				            <p><strong>Order ID:</strong> %d</p>
				            <p><strong>Status:</strong> %s</p>
				        </div>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(order.getUser().getName(), orderId, status);	
		// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(
					order.getUser().getEmail(), 
					"Order Status Update",
					htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}
		
		// Log the email response
		System.out.println("Email sent: " + emailResponse);
		
	}

	// issue refund
	public String issueRefundByAdmin(Long orderId) {
		Order order = orderRepository.findById(orderId).orElseThrow(() -> new NotFoundException("Order not found"));

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
			
			// set the product stock to the original stock
			Product product = order.getProduct();
			product.setStock(product.getStock() + order.getQuantity());
			productRepository.save(product);
			orderRepository.save(order);

			// Log it
			ActivityLogs.addEntry("Refund issued for order ID: " + orderId + " rupees " + order.getTotalAmount()
					+ " with payment ID: " + paymentId);

		} catch (Exception e) {
			e.printStackTrace();
			return "Refund failed: " + e.getMessage();
		}

		// send email, with order details like order id, product name, quantity, total
		String email = order.getUser().getEmail();
		String subject = "Refund Confirmation";
		// send html template with order details
		String htmlTemplate = """
				    			<!DOCTYPE html>
				<html>
				<head>
				    <meta charset="UTF-8">
				    <title>Your Order has been successfully cancelled and Amount is refunded</title>
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
				        <h2>Your Order has been successfully cancelled and Amount is refunded</h2>
				        <p>Dear %s,</p>
				        <p>Amount has been refunded! for the order %d</p>
				        <p><strong>Payment ID:</strong> %s</p>
				        <p><strong>Total Amount:</strong> $%.2f</p>

				        <div class="footer">
				            <p>Best Regards,<br>Darla Store</p>
				        </div>
				    </div>
				</body>
				</html>

				    			""".formatted(order.getUser().getName(), orderId, paymentId, order.getTotalAmount());
// Send the email using the EmailService
		String emailResponse;
		try {
			emailResponse = emailService.sendEmailWithHtmlTemplate(email, subject, htmlTemplate);
		} catch (Exception e) {
			throw new RuntimeException("Failed to send email", e);
		}
// Log the email response
		System.out.println("Email sent: " + emailResponse);

		return "Refund successful for order ID: " + orderId;
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
						.paymentId(order.getPaymentId()).imageData(order.getProduct().getImageData())

						.build())
				.toList();
		return ordersDto;
	}

	
	public Response updatePassword(Long userId, String oldPassword, String newPassword) {
		User user = userRepository.findById(userId).orElseThrow(() -> new NotFoundException("No Account found"));

		if (user.getPassword().isEmpty())
			throw new RuntimeException("You have not set password yet!");
		Response res = new Response();
//		new BCryptPasswordEncoder(12).encode(registerDto.getPassword())

		BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

//		String encodedPassword = new BCryptPasswordEncoder(12).encode(oldPassword);
//		System.out.println(encodedPassword.equals(user.getPassword()));	

		if (!encoder.matches(oldPassword, user.getPassword())) {
			res.setMessage("Wrong Password!");
			res.setStatus(400);
			return res;

		}

		user.setPassword(new BCryptPasswordEncoder(12).encode(newPassword));
		res.setStatus(200);
		res.setMessage("Password updated Successfully");
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
		
		res.setUser(Mapper.mapToUserDto(user));
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
				
				Response response = new Response();
				response.setStatus(200);
				response.setMessage("Login successful");
				response.setToken(token);
				response.setUser(Mapper.mapToUserDto(user));
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
			// check if the user is admin or not
			// if user is admin then skip that user
			if (user.getRole().equals("ADMIN"))
				return null;
			return Mapper.mapToUserDto(user);
		}).toList();

		return usersDto;
	}

}
