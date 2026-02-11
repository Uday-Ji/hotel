import type { MenuItem } from '@/types/common.types';

export const hotelMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Hotel Management',
    icon: 'hotel',
    isActive: true,
    children: [
      { id: 101, label: 'Hotel Master', path: '/hotel/hotel-master', isActive: true },
      { id: 102, label: 'Add/Edit Hotel', path: '/hotel/add-edit-hotel', isActive: true },
      { id: 103, label: 'Hotel Mapping', path: '/hotel/hotel-mapping', isActive: true },
      { id: 104, label: 'Hotel Images', path: '/hotel/hotel-images', isActive: true },
      { id: 105, label: 'Hotel Categories', path: '/hotel/hotel-category-master', isActive: true },
      { id: 106, label: 'Room Categories', path: '/hotel/room-category-master', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Rates & Pricing',
    icon: 'attach_money',
    isActive: true,
    children: [
      { id: 201, label: 'Hotel Room Rate', path: '/hotel/hotel-room-rate', isActive: true },
      { id: 202, label: 'Rate Update', path: '/hotel/hotel-room-rate-update', isActive: true },
      { id: 203, label: 'Blackout Dates', path: '/hotel/hotel-blackout', isActive: true },
    ],
  },
  {
    id: 3,
    label: 'Policies & Settings',
    icon: 'policy',
    isActive: true,
    children: [
      { id: 301, label: 'Cancellation Policy', path: '/hotel/cancellation-policy-master', isActive: true },
      { id: 302, label: 'Distance Master', path: '/hotel/distance-master', isActive: true },
    ],
  },
];

export const bookingMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Bookings',
    icon: 'book',
    isActive: true,
    children: [
      { id: 101, label: 'Booking Details', path: '/booking/booking-details', isActive: true },
      { id: 102, label: 'Booking History', path: '/booking/booking-history', isActive: true },
      { id: 103, label: 'Search Bookings', path: '/booking/search-bookings', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Allocation',
    icon: 'assignment',
    isActive: true,
    children: [
      { id: 201, label: 'Allocation Master', path: '/booking/allocation-master', isActive: true },
      { id: 202, label: 'Allocation Details', path: '/booking/allocation-details', isActive: true },
      { id: 203, label: 'Allocation Report', path: '/booking/allocation-report', isActive: true },
    ],
  },
];

export const rateMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Rate Management',
    icon: 'local_offer',
    isActive: true,
    children: [
      { id: 101, label: 'Rate Master', path: '/rate/rate-master', isActive: true },
      { id: 102, label: 'Inactive Rates', path: '/rate/inactive-rate', isActive: true },
      { id: 103, label: 'Manage Markup', path: '/rate/manage-markup', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Promotions',
    icon: 'campaign',
    isActive: true,
    children: [
      { id: 201, label: 'Early Bird', path: '/rate/early-bird', isActive: true },
      { id: 202, label: 'Long Stay', path: '/rate/long-stay', isActive: true },
      { id: 203, label: 'Free Nights', path: '/rate/free-nights', isActive: true },
      { id: 204, label: 'Special Promotion', path: '/rate/special-promotion', isActive: true },
    ],
  },
];

export const masterMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Location Masters',
    icon: 'location_on',
    isActive: true,
    children: [
      { id: 101, label: 'Country Master', path: '/master/country-master', isActive: true },
      { id: 102, label: 'City Master', path: '/master/city-master', isActive: true },
      { id: 103, label: 'Area Master', path: '/master/area-master', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Currency & Language',
    icon: 'language',
    isActive: true,
    children: [
      { id: 201, label: 'Currency Master', path: '/master/currency-master', isActive: true },
      { id: 202, label: 'Language Master', path: '/master/language-master', isActive: true },
    ],
  },
];

export const userMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'User Management',
    icon: 'people',
    isActive: true,
    children: [
      { id: 101, label: 'User Master', path: '/user/user-master', isActive: true },
      { id: 102, label: 'User Role Management', path: '/user/user-role-management', isActive: true },
      { id: 103, label: 'Menu Role Master', path: '/user/menu-role-master', isActive: true },
    ],
  },
];

export const transferMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Transfer Management',
    icon: 'directions_car',
    isActive: true,
    children: [
      { id: 101, label: 'Transfer Master', path: '/transfer/transfer-master', isActive: true },
      { id: 102, label: 'Transfer Programme', path: '/transfer/transfer-programme', isActive: true },
      { id: 103, label: 'Vehicle Category', path: '/transfer/vehicle-category', isActive: true },
    ],
  },
];

export const packageMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Package Management',
    icon: 'beach_access',
    isActive: true,
    children: [
      { id: 101, label: 'Package Master', path: '/package/package-master', isActive: true },
    ],
  },
];

export const sightseeingMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Sightseeing Management',
    icon: 'remove_red_eye',
    isActive: true,
    children: [
      { id: 101, label: 'Sightseeing Master', path: '/sightseeing/sightseeing-master', isActive: true },
    ],
  },
];

export const carMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Car Management',
    icon: 'drive_eta',
    isActive: true,
    children: [
      { id: 101, label: 'Car Master', path: '/car/car-master', isActive: true },
    ],
  },
];

export const marketMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Market Management',
    icon: 'trending_up',
    isActive: true,
    children: [
      { id: 101, label: 'Market Master', path: '/market/market-master', isActive: true },
    ],
  },
];

export const getModuleMenuItems = (moduleId: string): MenuItem[] => {
  const menuMap: Record<string, MenuItem[]> = {
    hotel: hotelMenuItems,
    booking: bookingMenuItems,
    rate: rateMenuItems,
    master: masterMenuItems,
    user: userMenuItems,
    transfer: transferMenuItems,
    package: packageMenuItems,
    sightseeing: sightseeingMenuItems,
    car: carMenuItems,
    market: marketMenuItems,
  };

  return menuMap[moduleId] || [];
};

export default getModuleMenuItems;