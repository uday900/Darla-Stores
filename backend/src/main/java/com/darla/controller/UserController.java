package com.darla.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import com.darla.dto.CartDto;
import com.darla.dto.CheckOutRequest;
import com.darla.dto.OrderDto;
import com.darla.dto.OrderRequest;
import com.darla.dto.RazorPaymentResponse;
import com.darla.dto.Response;
import com.darla.dto.UserDto;
import com.darla.service.UserService;
import com.razorpay.RazorpayException;

import jakarta.validation.*;


@RestController
@RequestMapping("/user")
public class UserController {
	
	@Autowired
	private UserService userService;
	
	// request for account deletion
	@DeleteMapping("/delete/account")
	@PreAuthorize("hasRole('ROLE_USER')")
	public ResponseEntity<Response> deleteAccount(@RequestParam Long userId, @RequestParam String password) {
		Response res = userService.deleteAccount(userId, password);
		
		return ResponseEntity.status(res.getStatus()).body(res);
	}
	
	// get user info for oauth2
			@GetMapping("/oauth/info")
			public ResponseEntity<?> oauthCallback(
//					OAuth2AuthenticationToken token
					@AuthenticationPrincipal OAuth2User userOauth
					){
//				System.out.println("Mode: inside callback url " + mode);
//				OAuth2User userOauth = token.getPrincipal();
				String email = userOauth.getAttribute("email");
				System.out.println(userOauth.getAttributes());
				if (email == null) {
					return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email not found in Authentication provider");
				}
				
				Response response = userService.oauthCallback(userOauth, AuthController.oAuthMode);
				return ResponseEntity.status(response.getStatus()).body(response);
			}
		
			
	@PostMapping("/update-password")
	public ResponseEntity<Response> updatePassword(
			@RequestParam Long userId,
			@RequestParam String oldPassword,
			@RequestParam String newPassword
			){
		Response res = userService.updatePassword(userId, oldPassword, newPassword);
		
		return ResponseEntity.status(res.getStatus()).body(res);
	}
	
	// get user-info
	@GetMapping("/info")
	public ResponseEntity<UserDto> getUserInfo(@RequestParam Long userId) {
		
		UserDto userDto = userService.getUserInfo(userId);
		
		return ResponseEntity.status(HttpStatus.OK).body(userDto);
	}
	
	
	// fetch all users, only for admin
	@GetMapping("/all")
	@PreAuthorize("hasRole('ROLE_ADMIN')")	
	public ResponseEntity<List<UserDto>> fetchAllUsers() {
		List<UserDto> users = userService.fetchAllUsers();
		return ResponseEntity.ok(users);
	}
	

	// Update user profile
    @PutMapping("/update/profile")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> updateProfile(
    		@RequestParam Long userId, 
    		@Valid @RequestBody UserDto userDto) {
        String response = userService.updateProfile(userId, userDto);
        return ResponseEntity.ok(response);
    }
	
   /*
    * cart details
    * API mappings for cart
    */
    // Add product to cart
    @PostMapping("/cart/add")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> addToCart(
    		@RequestParam Long userId,
    		@RequestParam Long productId) {
        String response = userService.addToCart(userId, productId);
        return ResponseEntity.ok(response);
    }
    
    // Remove product from cart
    @DeleteMapping("/cart/remove")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> removeFromCart(
    		@RequestParam Long userId,
    		@RequestParam Long cartId) {
        String response = userService.removeFromCart(userId, cartId);
        return ResponseEntity.ok(response);
    }

    // Increment product quantity
    @PutMapping("/cart/increment")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> incrementQuantity(
    		@RequestParam Long userId, 
    		@RequestParam Long cartId) {
        String response = userService.incrementQuantity(userId, cartId);
        return ResponseEntity.ok(response);
    }

    // Decrement product quantity
    @PutMapping("/cart/decrement")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<String> decrementQuantity(
    		@RequestParam Long userId, 
    		@RequestParam Long cartId) {
        String response = userService.decrementQuantity(userId, cartId);
        return ResponseEntity.ok(response);
    }

    // Fetch user cart
    @GetMapping("/cart")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<CartDto>> fetchUserCart(
    		@RequestParam Long userId) {
        List<CartDto> cartItems = userService.fetchUserCart(userId);
        return ResponseEntity.ok(cartItems);
    }

    
    /*
     * order details 
     * order mappings
     * 
     */
    
    @Value("${razorpay.api.secret}")
    private String razorpaySecret;
  
    
    // create order with razorpay
    @PostMapping("/order/create")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<Response> createOrder(
    		@Valid @RequestBody OrderRequest orderRequest
    		) throws RazorpayException{
    	if (orderRequest.getQuantity() <= 0) {
    		 throw new IllegalArgumentException("Quantity must be greater than 0");
    		            
    	}
    	System.out.println("order request: " + orderRequest.toString());
    	Response response = userService.placeOrderWithRazorPay(orderRequest);
    	
    	return ResponseEntity.status(response.getStatus()).body(response);
    	
    }
    // check out with razorpay
    @PostMapping("/order/checkout")
    @PreAuthorize("hasRole('ROLE_USER')")
	public ResponseEntity<Response> checkOutWithRazorPay(
			
			@Valid @RequestBody CheckOutRequest orderRequest)
			throws RazorpayException {
		
//		System.out.println("order request: " + orderRequest.toString());
		Response response = userService.checkOutWithRazorPay(orderRequest.getUserId(), orderRequest.getPaymentMode(), orderRequest.getShippingAddress());
		return ResponseEntity.status(response.getStatus()).body(response);
	}
    
    // verify order with razorpay
    @PostMapping("/order/verify")
	public ResponseEntity<Response> verifyOrder( 
			@Valid @RequestBody RazorPaymentResponse razorPaymentResponse) throws RazorpayException {
		System.out.println("razorpay response: " + razorPaymentResponse.toString());
    	
    	Response response = userService.verifyOrderWithRazorPay(razorPaymentResponse);
		
		return ResponseEntity.status(response.getStatus()).body(response);

	}
    
    // payment failure 
    @PostMapping("/order/payment-failure")
    public ResponseEntity<Response> paymentFailure(
    		@RequestParam String razorpay_order_id
    		) {
    	
    	Response res = userService.paymentFailure(razorpay_order_id);
    	return ResponseEntity.status(res.getStatus()).body(res);
    	
    	}
    
    @PostMapping("/order/{orderId}/refund")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Response> refundOrder(@PathVariable Long orderId) {
        String response = userService.issueRefundByAdmin(orderId);
        Response res = new Response();
        res.setMessage(response);
        return ResponseEntity.ok(res);
    }
    
//    @PostMapping("/order/place")
//    @PreAuthorize("hasRole('ROLE_USER')")
//    public ResponseEntity<Response> placeOrder(
//    		@RequestParam Long userId,
//    		@RequestParam Long productId,
//    		@RequestParam Integer quantity
//    		) throws RazorpayException{
//				if (quantity <= 0) {
//					throw new IllegalArgumentException("Quantity must be greater than 0");
//				}
//    	String message = userService.placeOrder(userId,
//    			productId, quantity);
//    	Response response = new Response();
//    	response.setMessage(message);
//  
//		return ResponseEntity.ok(response);
//    }
   
  
   @PutMapping("/order/update")
   public ResponseEntity<Response> updateOrder(
		   @RequestParam Long orderId,
		   @RequestParam String status
		   ){
	  
	   Response message = userService.updateOrder(orderId, status);
		return ResponseEntity.status(message.getStatus()).body(message);
	
   }
   
   @GetMapping("/orders/all")
   @PreAuthorize("hasRole('ROLE_ADMIN')")
   public ResponseEntity<List<OrderDto>> fetchAllOrders(){
	   return ResponseEntity.ok(
			   userService.fetchAllOrders()
			   );
   }
   @GetMapping("/orders")
   public ResponseEntity<List<OrderDto>> fetchOrdersByUser(
		   @RequestParam Long userId
		   ){
	   return ResponseEntity.ok(
			   userService.fetchOrdersByUser(userId)
			   );
   }
   
//   @PostMapping("/order/check-out")
//   @PreAuthorize("hasRole('ROLE_USER')")
//	public ResponseEntity<Response> checkOut(
//			@RequestParam Long userId){
//	   Response response = new Response();
//	   String msg = userService.checkOut(userId);
//	   response.setMessage(msg);
//	   
//		return ResponseEntity.ok(response);
//	}
    
	


}
