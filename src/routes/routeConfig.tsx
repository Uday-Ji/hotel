import React, { Suspense } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';
import ModuleLayout from '@/layouts/ModuleLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import CreatePackageWizard from '@/pages/package/CreatePackageWizard';

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
    <CircularProgress />
  </Box>
);

const Loadable = (Component: React.LazyExoticComponent<React.ComponentType<any>>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Auth Pages
const Login = Loadable(React.lazy(() => import('@/pages/auth/Login')));
const Welcome = Loadable(React.lazy(() => import('@/pages/auth/Welcome')));
const Plain = Loadable(React.lazy(() => import('@/pages/auth/Plain')));

// Dashboard
const Dashboard = Loadable(React.lazy(() => import('@/pages/dashboard/Dashboard')));
const ChooseHotel = Loadable(React.lazy(() => import('@/pages/dashboard/ChooseHotel')));

// Hotel Module (Key pages - rest will use PageTemplate)
const HotelMaster = Loadable(React.lazy(() => import('@/pages/hotel/HotelMaster')));
const AddEditHotel = Loadable(React.lazy(() => import('@/pages/hotel/AddEditHotel')));

// Page Template for remaining pages
const PageTemplate = Loadable(React.lazy(() => import('@/pages/PageTemplate')));
// Package Module
const PackageList = Loadable(React.lazy(() => import('@/pages/package/PackageList')));
const PackageWelcome = Loadable(React.lazy(() => import('@/pages/package/Welcome')));
const CreatePackage = Loadable(React.lazy(() => import('@/pages/package/CreatePackage')));
const HolidayCategoryTypeMapping = Loadable(React.lazy(() => import('@/pages/package/HolidayCategoryTypeMapping')));
const TabsType = Loadable(React.lazy(() => import('@/pages/package/TabsType')));
const FactsType = Loadable(React.lazy(() => import('@/pages/package/FactsType')));
const HolidayCategoryMaster = Loadable(React.lazy(() => import('@/pages/package/HolidayCategoryMaster')));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          { path: 'login', element: <Login /> },
          { path: 'welcome', element: <Welcome /> },
          { path: 'plain', element: <Plain /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <Dashboard /> },
          { path: 'choose-hotel', element: <ChooseHotel /> },
        ],
      },
      {
        element: <ModuleLayout />,
        children: [
          {
            path: 'hotel',
            children: [
              { path: 'hotel-master', element: <HotelMaster /> },
              { path: 'add-edit-hotel', element: <AddEditHotel /> },
              { path: 'add-edit-hotel/:id', element: <AddEditHotel /> },
              { path: 'hotel-mapping', element: <PageTemplate /> },
              { path: 'hotel-images', element: <PageTemplate /> },
              { path: 'hotel-category-master', element: <PageTemplate /> },
              { path: 'room-category-master', element: <PageTemplate /> },
              { path: 'hotel-room-rate', element: <PageTemplate /> },
              { path: 'hotel-blackout', element: <PageTemplate /> },
              { path: 'cancellation-policy-master', element: <PageTemplate /> },
              { path: 'distance-master', element: <PageTemplate /> },
            ],
          },
          {
            path: 'booking',
            children: [
              { path: 'booking-details', element: <PageTemplate /> },
              { path: 'booking-history', element: <PageTemplate /> },
              { path: 'search-bookings', element: <PageTemplate /> },
              { path: 'allocation-master', element: <PageTemplate /> },
              { path: 'allocation-details', element: <PageTemplate /> },
              { path: 'allocation-report', element: <PageTemplate /> },
            ],
          },
          {
            path: 'rate',
            children: [
              { path: 'rate-master', element: <PageTemplate /> },
              { path: 'inactive-rate', element: <PageTemplate /> },
              { path: 'early-bird', element: <PageTemplate /> },
              { path: 'long-stay', element: <PageTemplate /> },
              { path: 'free-nights', element: <PageTemplate /> },
              { path: 'special-promotion', element: <PageTemplate /> },
              { path: 'manage-markup', element: <PageTemplate /> },
            ],
          },
          {
            path: 'master',
            children: [
              { path: 'country-master', element: <PageTemplate /> },
              { path: 'city-master', element: <PageTemplate /> },
              { path: 'area-master', element: <PageTemplate /> },
              { path: 'currency-master', element: <PageTemplate /> },
              { path: 'language-master', element: <PageTemplate /> },
            ],
          },
          {
            path: 'user',
            children: [
              { path: 'user-master', element: <PageTemplate /> },
              { path: 'user-role-management', element: <PageTemplate /> },
              { path: 'menu-role-master', element: <PageTemplate /> },
            ],
          },
          {
            path: 'transfer',
            children: [
              { path: 'transfer-master', element: <PageTemplate /> },
              { path: 'transfer-programme', element: <PageTemplate /> },
              { path: 'vehicle-category', element: <PageTemplate /> },
            ],
          },
          {
            path: 'package',
            children: [
              { path: '', element: <Navigate to="package-list" replace /> },
              { path: 'package-list', element: <PackageList /> },
              { path: 'welcome', element: <PackageWelcome /> },
              { path: 'create-package-wizard', element: <CreatePackageWizard /> },
              { path: 'edit/:id', element: <CreatePackageWizard /> },
              { path: 'create-package', element: <CreatePackage /> },
              { path: 'holiday-category-type-mapping', element: <HolidayCategoryTypeMapping /> },
              { path: 'tabs-type', element: <TabsType /> },
              { path: 'facts-type', element: <FactsType /> },
              { path: 'holiday-category-master', element: <HolidayCategoryMaster /> },
            ],
          },
          {
            path: 'sightseeing',
            children: [{ path: 'sightseeing-master', element: <PageTemplate /> }],
          },
          {
            path: 'car',
            children: [{ path: 'car-master', element: <PageTemplate /> }],
          },
          {
            path: 'market',
            children: [{ path: 'market-master', element: <PageTemplate /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
];

export default routes;