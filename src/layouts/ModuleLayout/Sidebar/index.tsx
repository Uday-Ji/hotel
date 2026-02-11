import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Divider,
  Box,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebarCollapse } from '@/store/slices/uiSlice';
import type { MenuItem } from '@/types/common.types';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, sidebarMenuItems } = useAppSelector((state) => state.ui);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const handleToggleMenu = (menuId: number) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleToggleCollapse = () => {
    dispatch(toggleSidebarCollapse());
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];

    if (hasChildren) {
      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggleMenu(item.id)}
              sx={{ pl: level * 2 + 2 }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: level === 0 ? 600 : 400,
                }}
              />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children?.map((child) => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }

    return (
      <ListItem key={item.id} disablePadding>
        <ListItemButton
          onClick={() => item.path && handleNavigate(item.path)}
          selected={item.path ? isActive(item.path) : false}
          sx={{ pl: level * 2 + 2 }}
        >
          {level > 0 && (
            <ListItemIcon sx={{ minWidth: 32 }}>
              <FiberManualRecord sx={{ fontSize: 8 }} />
            </ListItemIcon>
          )}
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: '0.875rem',
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open={!sidebarCollapsed}
      className={styles.drawer}
      classes={{
        paper: sidebarCollapsed ? styles.drawerCollapsed : styles.drawerExpanded,
      }}
    >
      <Box className={styles.toolbar}>
        <IconButton onClick={handleToggleCollapse}>
          {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      <Divider />
      <List>{sidebarMenuItems.map((item) => renderMenuItem(item))}</List>
    </Drawer>
  );
};

export default Sidebar;