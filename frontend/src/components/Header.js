import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Search,
  Store
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          component={Link}
          to="/"
          sx={{ mr: 2 }}
        >
          <Store />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            쇼핑몰
          </Link>
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Search */}
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              size="small"
              placeholder="상품 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" size="small">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
              }}
            />
          </Box>

          {/* Products Link */}
          <Button color="inherit" component={Link} to="/products">
            상품
          </Button>

          {isAuthenticated ? (
            <>
              {/* Cart */}
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={cartCount} color="secondary">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose} component={Link} to="/orders">
                  주문 내역
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  로그아웃
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                로그인
              </Button>
              <Button color="inherit" component={Link} to="/register">
                회원가입
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;