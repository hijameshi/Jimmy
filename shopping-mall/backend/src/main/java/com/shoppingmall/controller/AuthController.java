package com.shoppingmall.controller;

import com.shoppingmall.dto.JwtResponse;
import com.shoppingmall.dto.LoginRequest;
import com.shoppingmall.dto.SignupRequest;
import com.shoppingmall.entity.User;
import com.shoppingmall.security.JwtUtils;
import com.shoppingmall.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(loginRequest.getUsername());

            User user = userService.findByUsername(loginRequest.getUsername()).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body("사용자를 찾을 수 없습니다.");
            }

            return ResponseEntity.ok(new JwtResponse(jwt, user.getId(), user.getUsername(), 
                                                   user.getEmail(), user.getFullName(), user.getRole()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "로그인에 실패했습니다. 사용자명과 비밀번호를 확인해주세요.");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();

        if (userService.existsByUsername(signUpRequest.getUsername())) {
            response.put("message", "이미 사용중인 사용자명입니다.");
            return ResponseEntity.badRequest().body(response);
        }

        if (userService.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "이미 사용중인 이메일입니다.");
            return ResponseEntity.badRequest().body(response);
        }

        // 새 사용자 생성
        User user = new User(signUpRequest.getUsername(),
                           signUpRequest.getPassword(),
                           signUpRequest.getEmail(),
                           signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setAddress(signUpRequest.getAddress());

        userService.createUser(user);

        response.put("message", "회원가입이 완료되었습니다.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-username/{username}")
    public ResponseEntity<?> checkUsername(@PathVariable String username) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !userService.existsByUsername(username));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmail(@PathVariable String email) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", !userService.existsByEmail(email));
        return ResponseEntity.ok(response);
    }
}