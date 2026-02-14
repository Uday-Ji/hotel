import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  Hotel,
  BookOnline,
  People,
  Inventory2,
  DirectionsCar,
  FlightTakeoff,
  Store,
  Public,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/services/api/axios.instance';

interface Module {
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  moduleDesc: string;
  moduleImage: string;
}

interface ModuleListProps {
  userRole: string;
  companyCode: string;
}

const moduleRouteMap: Record<string, string> = {
  Hotel: '/hotel/hotel-master',
  Booking: '/booking/booking-details',
  User: '/user/user-master',
  Package: '/package/package-list',
  Transfer: '/transfer/transfer-master',
  SeightSeeing: '/sightseeing/sightseeing-master',
  Car: '/car/car-master',
  Market: '/market/market-master',
};

const ModuleList: React.FC<ModuleListProps> = ({
  userRole,
  companyCode,
}) => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    getDashboardInformation();
  }, [userRole, companyCode]);

  const getDashboardInformation = () => {
    setLoading(true);

    apiClient
      .post('Common/ModuleList', { userRole, companyCode })
      .then((res) => setModules(res.data.data))
      .catch(() => setError('Failed to load modules'))
      .finally(() => setLoading(false));
  };

  const getModuleIcon = (code: string) => {
    switch (code) {
      case 'Market':
        return <Store fontSize="large" />;
      case 'Hotel':
        return <Hotel fontSize="large" />;
      case 'Booking':
        return <BookOnline fontSize="large" />;
      case 'User':
        return <People fontSize="large" />;
      case 'Package':
        return <Inventory2 fontSize="large" />;
      case 'Transfer':
        return <FlightTakeoff fontSize="large" />;
      case 'SeightSeeing':
        return <Public fontSize="large" />;
      case 'Car':
        return <DirectionsCar fontSize="large" />;
      default:
        return <Store fontSize="large" />;
    }
  };

  const getModuleRoute = (code: string) => {
    return moduleRouteMap[code] || '/dashboard';
  };

  if (loading) return <div>Loading modules...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box
      sx={{
        //minHeight: '100vh',
        padding: 5
        //background: 'linear-gradient(to right, #4facfe, #00f2fe)',
      }}
    >
      {/* Travel Header */}
      {/* <Box mb={5}>
        <Typography
          variant="h3"
          fontWeight={700}
          color="white"
          gutterBottom
        >
          ✈️ Explore Your Travel Dashboard
        </Typography>
        <Typography variant="h6" color="rgba(255,255,255,0.85)">
          Manage your travel operations seamlessly
        </Typography>
      </Box> */}

      {/* Cards */}
      <Grid container spacing={4}>
        {modules.map((module) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={module.moduleId}>
            <Card
              onClick={() =>
                navigate(getModuleRoute(module.moduleCode))
              }
              sx={{
                cursor: 'pointer',
                borderRadius: 5,
                padding: 3,
                background:
                  'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(15px)',
                transition: 'all 0.35s ease',
                boxShadow:
                  '0 8px 25px rgba(0,0,0,0.15)',
                '&:hover': {
                  transform:
                    'translateY(-12px) scale(1.03)',
                  boxShadow:
                    '0 20px 40px rgba(0,0,0,0.25)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                {/* Icon Bubble */}
                <Box
                  sx={{
                    width: 75,
                    height: 75,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #43cea2, #185a9d)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                  }}
                >
                  {getModuleIcon(module.moduleCode)}
                </Box>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  gutterBottom
                >
                  {module.moduleName}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {module.moduleDesc}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ModuleList;
