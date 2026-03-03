import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setActiveModule, setSidebarMenuItems } from '@/store/slices/uiSlice';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import styles from './ModuleLayout.module.css';
import { getModuleMenuItems } from './sidebarConfig';

const ModuleLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarOpen, sidebarCollapsed } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const moduleId = pathSegments[0];

    if (moduleId) {
      dispatch(setActiveModule(moduleId));
      const menuItems = getModuleMenuItems(moduleId);
      dispatch(setSidebarMenuItems(menuItems));
    }
  }, [location.pathname, dispatch]);


const handleMenuClick = () => {
    //setSidebarOpen(!sidebarOpen);
  };
  return (
    <Box className={styles.moduleLayout}>
     
     <TopNav onMenuClick={handleMenuClick} companyCode="SMT" />
      <Box className={styles.container}>
        {sidebarOpen && <Sidebar />}
        <Box
          className={`${styles.content} ${
            sidebarOpen
              ? sidebarCollapsed
                ? styles.contentShifted
                : styles.contentShiftedFull
              : ''
          }`}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ModuleLayout;