package com.shopping.mapper;

import com.shopping.model.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {
    
    // 사용자 생성
    int insertUser(User user);
    
    // 사용자 조회
    User findById(Long id);
    
    // 사용자명으로 조회
    User findByUsername(String username);
    
    // 이메일로 조회
    User findByEmail(String email);
    
    // 모든 사용자 조회
    List<User> findAll();
    
    // 사용자 정보 업데이트
    int updateUser(User user);
    
    // 사용자 삭제
    int deleteUser(Long id);
    
    // 사용자 존재 여부 확인
    boolean existsByUsername(String username);
    
    // 이메일 존재 여부 확인
    boolean existsByEmail(String email);
}