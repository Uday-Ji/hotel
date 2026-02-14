import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Apps as AppsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styles from './TopNav.module.css';

interface TopNavProps {
  onMenuClick: () => void;
  companyCode?: string;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, companyCode = 'SMT' }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" className={styles.appBar} elevation={0}>
      <Toolbar className={styles.toolbar}>
        {/* Left Section */}
        <Box className={styles.leftSection}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Box className={styles.brandSection}>
            <Typography variant="h6" className={styles.brandText}>
              Connect My Trip
            </Typography>
            <Chip label="Pro" size="small" className={styles.proBadge} />
          </Box>
        </Box>

        {/* Right Section */}
        <Box className={styles.rightSection}>
          <Tooltip title="Modules">
            <IconButton className={styles.iconButton} onClick={() => navigate('/dashboard')}>
              <AppsIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton className={styles.iconButton}>
              <NotificationsIcon />
            </IconButton>
          </Tooltip>

          <Box className={styles.divider} />

          <Box className={styles.userSection} onClick={handleMenuOpen}>
            <Avatar className={styles.avatar}>S</Avatar>
            <Box className={styles.userInfo}>
              <Typography variant="body2" className={styles.companyCode}>
                {companyCode}
              </Typography>
            </Box>
            <ArrowDownIcon fontSize="small" className={styles.arrowIcon} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            className={styles.userMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              My Profile
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNav;