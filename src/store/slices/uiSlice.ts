import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MenuItem } from '@/types/common.types';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeModule: string | null;
  sidebarMenuItems: MenuItem[];
  breadcrumbs: { label: string; path?: string }[];
}

const initialState: UIState = {
  sidebarOpen: false,
  sidebarCollapsed: false,
  activeModule: null,
  sidebarMenuItems: [],
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapse: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setActiveModule: (state, action: PayloadAction<string | null>) => {
      state.activeModule = action.payload;
      state.sidebarOpen = !!action.payload;
    },
    setSidebarMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.sidebarMenuItems = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<{ label: string; path?: string }[]>
    ) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapse,
  setActiveModule,
  setSidebarMenuItems,
  setBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;