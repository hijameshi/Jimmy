package com.shopping.service;

import com.shopping.mapper.UserMapper;
import com.shopping.model.User;
import com.shopping.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public User registerUser(User user) {
        // 사용자명 중복 확인
        if (userMapper.existsByUsername(user.getUsername())) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }

        // 이메일 중복 확인
        if (userMapper.existsByEmail(user.getEmail())) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 비밀번호 암호화
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 기본 역할 설정
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }

        userMapper.insertUser(user);
        return user;
    }

    public String authenticateUser(String username, String password) {
        User user = userMapper.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole().toString());
    }

    public User findById(Long id) {
        return userMapper.findById(id);
    }

    public User findByUsername(String username) {
        return userMapper.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userMapper.findByEmail(email);
    }

    public List<User> findAllUsers() {
        return userMapper.findAll();
    }

    public User updateUser(User user) {
        User existingUser = userMapper.findById(user.getId());
        if (existingUser == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }

        // 비밀번호가 변경된 경우에만 암호화
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(existingUser.getPassword());
        }

        userMapper.updateUser(user);
        return user;
    }

    public void deleteUser(Long id) {
        User user = userMapper.findById(id);
        if (user == null) {
            throw new RuntimeException("사용자를 찾을 수 없습니다.");
        }
        userMapper.deleteUser(id);
    }

    public boolean existsByUsername(String username) {
        return userMapper.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userMapper.existsByEmail(email);
    }
}