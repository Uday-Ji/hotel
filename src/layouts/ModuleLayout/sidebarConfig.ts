import type { MenuItem } from '@/types/common.types';

export const hotelMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Hotel Management',
    icon: 'hotel',
    isActive: true,
    children: [
      { id: 101, label: 'Hotel Master', icon: 'hotel', path: '/hotel/hotel-master', isActive: true },
      { id: 102, label: 'Add/Edit Hotel', icon: 'edit_note', path: '/hotel/add-edit-hotel', isActive: true },
      { id: 103, label: 'Hotel Mapping', icon: 'map', path: '/hotel/hotel-mapping', isActive: true },
      { id: 104, label: 'Hotel Images', icon: 'photo_library', path: '/hotel/hotel-images', isActive: true },
      { id: 105, label: 'Hotel Categories', icon: 'category', path: '/hotel/hotel-category-master', isActive: true },
      { id: 106, label: 'Room Categories', icon: 'king_bed', path: '/hotel/room-category-master', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Rates & Pricing',
    icon: 'attach_money',
    isActive: true,
    children: [
      { id: 201, label: 'Hotel Room Rate', icon: 'attach_money', path: '/hotel/hotel-room-rate', isActive: true },
      { id: 202, label: 'Rate Update', icon: 'update', path: '/hotel/hotel-room-rate-update', isActive: true },
      { id: 203, label: 'Blackout Dates', icon: 'event_busy', path: '/hotel/hotel-blackout', isActive: true },
    ],
  },
  {
    id: 3,
    label: 'Policies & Settings',
    icon: 'policy',
    isActive: true,
    children: [
      { id: 301, label: 'Cancellation Policy', icon: 'cancel', path: '/hotel/cancellation-policy-master', isActive: true },
      { id: 302, label: 'Distance Master', icon: 'straighten', path: '/hotel/distance-master', isActive: true },
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
      { id: 101, label: 'Booking Details', icon: 'description', path: '/booking/booking-details', isActive: true },
      { id: 102, label: 'Booking History', icon: 'history', path: '/booking/booking-history', isActive: true },
      { id: 103, label: 'Search Bookings', icon: 'search', path: '/booking/search-bookings', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Allocation',
    icon: 'assignment',
    isActive: true,
    children: [
      { id: 201, label: 'Allocation Master', icon: 'assignment', path: '/booking/allocation-master', isActive: true },
      { id: 202, label: 'Allocation Details', icon: 'assignment_turned_in', path: '/booking/allocation-details', isActive: true },
      { id: 203, label: 'Allocation Report', icon: 'bar_chart', path: '/booking/allocation-report', isActive: true },
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
      { id: 101, label: 'Rate Master', icon: 'local_offer', path: '/rate/rate-master', isActive: true },
      { id: 102, label: 'Inactive Rates', icon: 'block', path: '/rate/inactive-rate', isActive: true },
      { id: 103, label: 'Manage Markup', icon: 'price_change', path: '/rate/manage-markup', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Promotions',
    icon: 'campaign',
    isActive: true,
    children: [
      { id: 201, label: 'Early Bird', icon: 'alarm', path: '/rate/early-bird', isActive: true },
      { id: 202, label: 'Long Stay', icon: 'date_range', path: '/rate/long-stay', isActive: true },
      { id: 203, label: 'Free Nights', icon: 'nights_stay', path: '/rate/free-nights', isActive: true },
      { id: 204, label: 'Special Promotion', icon: 'campaign', path: '/rate/special-promotion', isActive: true },
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
      { id: 101, label: 'Country Master', icon: 'public', path: '/master/country-master', isActive: true },
      { id: 102, label: 'City Master', icon: 'location_city', path: '/master/city-master', isActive: true },
      { id: 103, label: 'Area Master', icon: 'map', path: '/master/area-master', isActive: true },
    ],
  },
  {
    id: 2,
    label: 'Currency & Language',
    icon: 'language',
    isActive: true,
    children: [
      { id: 201, label: 'Currency Master', icon: 'paid', path: '/master/currency-master', isActive: true },
      { id: 202, label: 'Language Master', icon: 'translate', path: '/master/language-master', isActive: true },
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
      { id: 101, label: 'User Master', icon: 'person', path: '/user/user-master', isActive: true },
      { id: 102, label: 'User Role Management', icon: 'admin_panel_settings', path: '/user/user-role-management', isActive: true },
      { id: 103, label: 'Menu Role Master', icon: 'menu', path: '/user/menu-role-master', isActive: true },
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
      { id: 101, label: 'Transfer Master', icon: 'directions_car', path: '/transfer/transfer-master', isActive: true },
      { id: 102, label: 'Transfer Programme', icon: 'route', path: '/transfer/transfer-programme', isActive: true },
      { id: 103, label: 'Vehicle Category', icon: 'directions_bus', path: '/transfer/vehicle-category', isActive: true },
    ],
  },
];

export const packageMenuItems: MenuItem[] = [
  {
    id: 1,
    label: 'Package Master',
    icon: 'beach_access',
    path: '/package/package-list',
    isActive: true,
  },
  {
    id: 3,
    label: 'Mapping Masters',
    icon: 'map',
    isActive: true,
    children: [
      { id: 301, label: 'Holiday Category-Type', icon: 'account_tree', path: '/package/holiday-category-type-mapping', isActive: true },
      { id: 302, label: 'Tabs Type', icon: 'tab', path: '/package/tabs-type', isActive: true },
      { id: 303, label: 'Holiday Type-Tab', icon: 'link', path: '/package/holiday-type-tab-mapping', isActive: true },
    ],
  },
  {
    id: 4,
    label: 'Manage Offers',
    icon: 'local_offer',
    isActive: true,
    children: [
      { id: 401, label: 'Offer Type Master', icon: 'sell', path: '/package/offer-type-master', isActive: true },
      { id: 402, label: 'Manage Package Offer', icon: 'discount', path: '/package/manage-package-offer', isActive: true },
    ],
  },
  {
    id: 5,
    label: 'Component Masters',
    icon: 'dashboard',
    isActive: true,
    children: [
      { id: 501, label: 'Package Components', icon: 'widgets', path: '/package/package-components', isActive: true },
      { id: 502, label: 'Facts Type', icon: 'info', path: '/package/facts-type', isActive: true },
    ],
  },
  {
    id: 6,
    label: 'Manage Masters',
    icon: 'settings',
    isActive: true,
    children: [
      { id: 601, label: 'Holiday Category', icon: 'category', path: '/package/master/holiday-category-master', isActive: true },
      { id: 602, label: 'Departure Cities', icon: 'flight_takeoff', path: '/package/master/departure-city-master', isActive: true },
      { id: 603, label: 'Region', icon: 'public', path: '/package/master/region-master', isActive: true },
      { id: 604, label: 'Market Master', icon: 'store', path: '/package/master/market-master', isActive: true },
      { id: 605, label: 'Holiday Type', icon: 'beach_access', path: '/package/master/holiday-type-master', isActive: true },
      { id: 606, label: 'Tour Type', icon: 'tour', path: '/package/master/tour-type-master', isActive: true },
      { id: 607, label: 'Package Category', icon: 'label', path: '/package/master/package-category-master', isActive: true },
      { id: 608, label: 'Facts Type', icon: 'fact_check', path: '/package/master/facts-type-master', isActive: true },
      { id: 609, label: 'Hotel Mapping', icon: 'hotel', path: '/package/master/hotel-mapping-master', isActive: true },
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
      { id: 101, label: 'Sightseeing Master', icon: 'remove_red_eye', path: '/sightseeing/sightseeing-master', isActive: true },
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
      { id: 101, label: 'Car Master', icon: 'drive_eta', path: '/car/car-master', isActive: true },
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
      { id: 101, label: 'Market Master', icon: 'store', path: '/market/market-master', isActive: true },
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