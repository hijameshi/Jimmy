package com.shoppingmall.mapper;

import com.shoppingmall.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    
    // 사용자 생성
    void insertUser(User user);
    
    // 사용자 조회
    Optional<User> findById(Long id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    
    // 사용자 목록 조회
    List<User> findAll();
    
    // 사용자 정보 업데이트
    void updateUser(User user);
    
    // 사용자 삭제
    void deleteById(Long id);
    
    // 사용자명 중복 체크
    boolean existsByUsername(String username);
    
    // 이메일 중복 체크
    boolean existsByEmail(String email);
}