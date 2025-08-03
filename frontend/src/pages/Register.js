import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setMessage('비밀번호가 일치하지 않습니다.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    // 필수 필드 확인
    if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
      setMessage('필수 필드를 모두 입력해주세요.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setMessage(result.message);
      setMessageType('error');
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            회원가입
          </Typography>
          
          {message && (
            <Alert severity={messageType} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="사용자명"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              helperText="영문, 숫자 조합 4-20자"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="비밀번호"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              helperText="8자 이상"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="비밀번호 확인"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="이메일"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="이름"
              name="fullName"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="전화번호"
              name="phone"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleChange}
              helperText="선택사항"
            />
            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="주소"
              name="address"
              autoComplete="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
              helperText="선택사항"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? '가입 중...' : '회원가입'}
            </Button>
            <Box textAlign="center">
              <MuiLink component={Link} to="/login" variant="body2">
                이미 계정이 있으신가요? 로그인
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;