import React from 'react';

import {
  Container,
 
  Box,
} from '@mui/material';
// import {
//   Hotel as HotelIcon,
//   Book as BookingIcon,
//   Person as UserIcon,
//   BeachAccess as PackageIcon,
//   DirectionsCar as TransferIcon,
//   RemoveRedEye as SightseeingIcon,
//   DriveEta as CarIcon,
//   TrendingUp as MarketIcon,
// } from '@mui/icons-material';
// import type { Module } from '@/types/common.types';
import styles from './Dashboard.module.css';
import ModuleList from '@/components/common/ModuleList';
import { useAppSelector } from '@/store/hooks';

// const modules: Module[] = [
//   {
//     id: 'hotel',
//     name: 'Manage Hotel',
//     description: 'Hotel management and configuration',
//     icon: 'hotel',
//     path: '/hotel/hotel-master',
//     isActive: true,
//     color: '#0EA5E9',
//   },
//   {
//     id: 'booking',
//     name: 'Manage Booking',
//     description: 'Booking and reservation management',
//     icon: 'booking',
//     path: '/booking/booking-details',
//     isActive: true,
//     color: '#475569',
//   },
//   {
//     id: 'user',
//     name: 'User Master',
//     description: 'User and access management',
//     icon: 'user',
//     path: '/user/user-master',
//     isActive: true,
//     color: '#78716C',
//   },
//   {
//     id: 'package',
//     name: 'Manage Package',
//     description: 'Package and tour management',
//     icon: 'package',
//     path: '/package/package-master',
//     isActive: true,
//     color: '#7DD3FC',
//   },
//   {
//     id: 'transfer',
//     name: 'Manage Transfer',
//     description: 'Transfer and transportation',
//     icon: 'transfer',
//     path: '/transfer/transfer-master',
//     isActive: true,
//     color: '#E5E7EB',
//   },
//   {
//     id: 'sightseeing',
//     name: 'Manage SightSeeing',
//     description: 'Sightseeing tours and activities',
//     icon: 'sightseeing',
//     path: '/sightseeing/sightseeing-master',
//     isActive: true,
//     color: '#E5E7EB',
//   },
//   {
//     id: 'car',
//     name: 'Manage Car',
//     description: 'Car rental management',
//     icon: 'car',
//     path: '/car/car-master',
//     isActive: true,
//     color: '#E5E7EB',
//   },
//   {
//     id: 'market',
//     name: 'Manage Market',
//     description: 'Market analysis and trends',
//     icon: 'market',
//     path: '/market/market-master',
//     isActive: true,
//     color: '#BAE6FD',
//   },
// ];

// const iconMap: Record<string, { component: React.ReactElement; bgColor: string }> = {
//   hotel: {
//     component: <HotelIcon sx={{ fontSize: 64, color: '#fff' }} />,
//     bgColor: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
//   },
//   booking: {
//     component: <BookingIcon sx={{ fontSize: 64, color: '#fff' }} />,
//     bgColor: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
//   },
//   user: {
//     component: <UserIcon sx={{ fontSize: 64, color: '#fff' }} />,
//     bgColor: 'linear-gradient(135deg, #78716C 0%, #57534E 100%)',
//   },
//   package: {
//     component: <PackageIcon sx={{ fontSize: 64, color: '#fff' }} />,
//     bgColor: 'linear-gradient(135deg, #7DD3FC 0%, #38BDF8 100%)',
//   },
//   transfer: {
//     component: <TransferIcon sx={{ fontSize: 64, color: '#6B7280' }} />,
//     bgColor: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
//   },
//   sightseeing: {
//     component: <SightseeingIcon sx={{ fontSize: 64, color: '#6B7280' }} />,
//     bgColor: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
//   },
//   car: {
//     component: <CarIcon sx={{ fontSize: 64, color: '#6B7280' }} />,
//     bgColor: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
//   },
//   market: {
//     component: <MarketIcon sx={{ fontSize: 64, color: '#0EA5E9' }} />,
//     bgColor: 'linear-gradient(135deg, #BAE6FD 0%, #7DD3FC 100%)',
//   },
// };


const Dashboard: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  
console.log('Dashboard user:', user);
  return (
    <Box className={styles.dashboardWrapper}>
      <Container maxWidth="xl" className={styles.dashboard}>
        {user && (
          <ModuleList userRole={user.userRole} companyCode='SMT' />
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;