import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  // Parent-level icons
  Hotel,
  AttachMoney,
  Policy,
  BookOnline,
  Assignment,
  LocalOffer,
  Campaign,
  LocationOn,
  Language,
  People,
  DirectionsCar,
  Visibility,
  BeachAccess,
  Map,
  Dashboard,
  Settings,
  FormatListBulleted,
  FolderOutlined,
  // Child-level icons
  AddCircleOutline,
  EditNote,
  Cancel,
  AddBusiness,
  AccountTree,
  Tab,
  Link,
  Sell,
  Discount,
  Widgets,
  Info,
  Category,
  FlightTakeoff,
  Public,
  Store,
  Tour,
  Label,
  FactCheck,
  Celebration,
  WavingHand,
  // Additional child icons
  Collections,
  KingBed,
  Update,
  EventBusy,
  Description,
  History as HistoryIcon,
  Search,
  AssignmentTurnedIn,
  BarChart,
  Block,
  MonetizationOn,
  Alarm,
  DateRange,
  Bedtime,
  LocationCity,
  Paid,
  Translate,
  Person,
  AdminPanelSettings,
  Menu as MenuIconMUI,
  AltRoute,
  DirectionsBus,
  DriveEta,
  TrendingUp,
  Straighten,
  PhotoLibrary,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSidebarCollapse } from '@/store/slices/uiSlice';
import type { MenuItem } from '@/types/common.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 64;

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  // Parent sections
  hotel: Hotel,
  attach_money: AttachMoney,
  policy: Policy,
  book: BookOnline,
  assignment: Assignment,
  local_offer: LocalOffer,
  campaign: Campaign,
  location_on: LocationOn,
  language: Language,
  people: People,
  directions_car: DirectionsCar,
  remove_red_eye: Visibility,
  beach_access: BeachAccess,
  map: Map,
  dashboard: Dashboard,
  settings: Settings,
  list: FormatListBulleted,
  drive_eta: DriveEta,
  trending_up: TrendingUp,
  // Child items — packages
  add_circle: AddCircleOutline,
  edit_note: EditNote,
  cancel: Cancel,
  add_business: AddBusiness,
  account_tree: AccountTree,
  tab: Tab,
  link: Link,
  sell: Sell,
  discount: Discount,
  widgets: Widgets,
  info: Info,
  category: Category,
  flight_takeoff: FlightTakeoff,
  public: Public,
  store: Store,
  tour: Tour,
  label: Label,
  fact_check: FactCheck,
  celebration: Celebration,
  waving_hand: WavingHand,
  // Child items — hotel & other modules
  collections: Collections,
  photo_library: PhotoLibrary,
  king_bed: KingBed,
  update: Update,
  event_busy: EventBusy,
  description: Description,
  history: HistoryIcon,
  search: Search,
  assignment_turned_in: AssignmentTurnedIn,
  bar_chart: BarChart,
  block: Block,
  price_change: MonetizationOn,
  alarm: Alarm,
  date_range: DateRange,
  nights_stay: Bedtime,
  location_city: LocationCity,
  paid: Paid,
  translate: Translate,
  person: Person,
  admin_panel_settings: AdminPanelSettings,
  menu: MenuIconMUI,
  route: AltRoute,
  directions_bus: DirectionsBus,
  straighten: Straighten,
};

const getIcon = (iconName?: string): React.ElementType =>
  (iconName && ICON_MAP[iconName]) || FolderOutlined;

// ─── Component ────────────────────────────────────────────────────────────────

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, sidebarMenuItems } = useAppSelector((s) => s.ui);
  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const isActive = (path?: string) => !!path && location.pathname === path;

  const isParentActive = (item: MenuItem): boolean => {
    if (isActive(item.path)) return true;
    return item.children?.some((c) => isActive(c.path)) ?? false;
  };

  const handleToggleMenu = (id: number) => {
    if (sidebarCollapsed) {
      dispatch(toggleSidebarCollapse());
      setOpenMenus({ [id]: true });
      return;
    }
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavigate = (path?: string) => {
    if (path) navigate(path);
  };

  const handleToggleCollapse = () => dispatch(toggleSidebarCollapse());

  // ─── Render ──────────────────────────────────────────────────────────────

  const renderMenuItem = (item: MenuItem, level = 0): JSX.Element => {
    const hasChildren = !!item.children?.length;
    const active = isActive(item.path);
    const parentActive = hasChildren && isParentActive(item);
    const isOpen = openMenus[item.id];
    const IconComp = getIcon(item.icon);

    if (hasChildren) {
      // ─ Parent item ─
      const btn = (
        <ListItemButton
          onClick={() => handleToggleMenu(item.id)}
          sx={{
            pl: sidebarCollapsed ? 0 : 2,
            py: 0.875,
            mx: 0.75,
            borderRadius: '10px',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
            minHeight: 44,
            gap: 0,
            bgcolor: parentActive ? 'rgba(102,126,234,0.08)' : 'transparent',
            '&:hover': {
              bgcolor: parentActive
                ? 'rgba(102,126,234,0.12)'
                : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: sidebarCollapsed ? 0 : 34,
              color: parentActive ? '#667eea' : '#64748b',
              justifyContent: 'center',
            }}
          >
            <IconComp sx={{ fontSize: 20 }} />
          </ListItemIcon>
          {!sidebarCollapsed && (
            <>
              <ListItemText
                primary={item.label}
                sx={{ my: 0 }}
                primaryTypographyProps={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: parentActive ? '#667eea' : '#1e293b',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              />
              {isOpen ? (
                <ExpandLess sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 16, color: '#94a3b8', flexShrink: 0 }} />
              )}
            </>
          )}
        </ListItemButton>
      );

      return (
        <React.Fragment key={item.id}>
          <ListItem disablePadding sx={{ display: 'block', mb: 0.25 }}>
            {sidebarCollapsed ? (
              <Tooltip title={item.label} placement="right" arrow>
                {btn}
              </Tooltip>
            ) : (
              btn
            )}
          </ListItem>
          {!sidebarCollapsed && (
            <Collapse in={isOpen} timeout={200} unmountOnExit>
              {/* Tree connector line */}
              <Box sx={{ position: 'relative', ml: 4.5 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: 0,
                    bottom: 8,
                    width: '1px',
                    bgcolor: '#e2e8f0',
                  }}
                />
                <List disablePadding>
                  {item.children!.map((child) => renderMenuItem(child, level + 1))}
                </List>
              </Box>
            </Collapse>
          )}
        </React.Fragment>
      );
    }

    // ─ Leaf item ─
    const ChildIconComp = getIcon(item.icon);
    const btn = (
      <ListItemButton
        onClick={() => handleNavigate(item.path)}
        sx={{
          pl: sidebarCollapsed ? 0 : level === 0 ? 2 : 1.5,
          pr: 1.5,
          py: 0.75,
          mx: 0.75,
          borderRadius: '10px',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          minHeight: 40,
          position: 'relative',
          bgcolor: active ? 'rgba(102,126,234,0.1)' : 'transparent',
          borderLeft:
            active && !sidebarCollapsed && level === 0
              ? '3px solid #667eea'
              : '3px solid transparent',
          '&:hover': {
            bgcolor: active
              ? 'rgba(102,126,234,0.14)'
              : 'rgba(0,0,0,0.04)',
          },
        }}
      >
        {level === 0 ? (
          <ListItemIcon
            sx={{
              minWidth: sidebarCollapsed ? 0 : 34,
              color: active ? '#667eea' : '#64748b',
              justifyContent: 'center',
            }}
          >
            <ChildIconComp sx={{ fontSize: 20 }} />
          </ListItemIcon>
        ) : (
          !sidebarCollapsed && (
            item.icon ? (
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: active ? '#667eea' : '#94a3b8',
                  justifyContent: 'center',
                }}
              >
                <ChildIconComp sx={{ fontSize: 16 }} />
              </ListItemIcon>
            ) : (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: active ? '#667eea' : '#cbd5e1',
                  flexShrink: 0,
                  mr: 1.5,
                  ml: 0.5,
                }}
              />
            )
          )
        )}
        {!sidebarCollapsed && (
          <ListItemText
            primary={item.label}
            sx={{ my: 0 }}
            primaryTypographyProps={{
              fontSize: '0.8rem',
              fontWeight: active ? 600 : 400,
              color: active ? '#667eea' : level === 0 ? '#1e293b' : '#475569',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          />
        )}
      </ListItemButton>
    );

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block', mb: 0.125 }}>
        {sidebarCollapsed && level === 0 ? (
          <Tooltip title={item.label} placement="right" arrow>
            {btn}
          </Tooltip>
        ) : (
          btn
        )}
      </ListItem>
    );
  };

  return (
    <Box
      sx={{
        width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        position: 'fixed',
        top: 64,
        left: 0,
        height: 'calc(100vh - 64px)',
        bgcolor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1100,
        overflowX: 'hidden',
        boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          px: sidebarCollapsed ? 0.5 : 2,
          py: 1,
          borderBottom: '1px solid #f1f5f9',
          minHeight: 52,
          flexShrink: 0,
        }}
      >
        {!sidebarCollapsed && (
          <Typography
            sx={{
              fontWeight: 700,
              color: '#667eea',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            Navigation
          </Typography>
        )}
        <Tooltip title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
          <IconButton
            size="small"
            onClick={handleToggleCollapse}
            sx={{
              width: 28,
              height: 28,
              color: '#64748b',
              bgcolor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#f0f0ff', color: '#667eea', borderColor: '#667eea' },
            }}
          >
            {sidebarCollapsed ? (
              <ChevronRight sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeft sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Scrollable menu list */}
      <List
        disablePadding
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#e2e8f0',
            borderRadius: 4,
            '&:hover': { bgcolor: '#cbd5e1' },
          },
        }}
      >
        {sidebarMenuItems.map((item) => renderMenuItem(item))}
      </List>

      {/* Footer */}
      {!sidebarCollapsed && (
        <Box
          sx={{
            borderTop: '1px solid #f1f5f9',
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
            Connect My Trip
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
