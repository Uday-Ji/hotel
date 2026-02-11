import React from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import styles from './DashboardLayout.module.css';

const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await dispatch(logout());
  };

  return (
    <Box className={styles.dashboardLayout}>
      {/* ================= HEADER ================= */}
      <AppBar
  position="sticky"
  elevation={0}
  sx={{
    background: 'linear-gradient(135deg, #4F8CFF 0%, #6C5CE7 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  }}
>
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            minHeight: 64,
            px: { xs: 2, md: 4 },
          }}
        >
          {/* Logo / Brand */}
          <Typography
            variant="h6"
            sx={{
              color: '#fff',
              fontWeight: 600,
              letterSpacing: 0.6,
              fontSize: 20,
            }}
          >
            Connect My Trip
          </Typography>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 0.8,
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: '#2F80ED',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {user?.firstName?.[0] || 'A'}
              </Avatar>

              <Typography
                variant="body2"
                sx={{ color: '#fff', fontWeight: 500 }}
              >
                {user?.firstName || 'Admin'}
              </Typography>

              <KeyboardArrowDown sx={{ color: '#fff', fontSize: 20 }} />
            </Box>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  p: 0.5,
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMenuClose}>
                <PersonOutlineIcon sx={{ mr: 1.5 }} />
                My Profile
              </MenuItem>

              <MenuItem onClick={handleMenuClose}>
                <SettingsIcon sx={{ mr: 1.5 }} />
                Settings
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  color: '#e53935',
                  fontWeight: 500,
                }}
              >
                <LogoutIcon sx={{ mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ================= CONTENT ================= */}
      <Box className={styles.content}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
