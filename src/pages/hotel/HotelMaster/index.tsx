import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchHotels, deleteHotel } from '@/store/slices/hotelSlice';
import styles from './HotelMaster.module.css';

const HotelMaster: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hotels, total, isLoading } = useAppSelector((state) => state.hotel);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(
      fetchHotels({
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        searchTerm,
      })
    );
  }, [paginationModel, searchTerm, dispatch]);

  const handleAddNew = () => {
    navigate('/hotel/add-edit-hotel');
  };

  const handleEdit = (id: number) => {
    navigate(`/hotel/add-edit-hotel/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/hotel/add-edit-hotel/${id}?view=true`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this hotel?')) {
      await dispatch(deleteHotel(id));
      dispatch(
        fetchHotels({
          page: paginationModel.page + 1,
          pageSize: paginationModel.pageSize,
          searchTerm,
        })
      );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'hotelCode',
      headerName: 'Hotel Code',
      width: 120,
      sortable: true,
    },
    {
      field: 'hotelName',
      headerName: 'Hotel Name',
      width: 250,
      sortable: true,
    },
    {
      field: 'cityName',
      headerName: 'City',
      width: 150,
      sortable: true,
    },
    {
      field: 'countryName',
      headerName: 'Country',
      width: 150,
      sortable: true,
    },
    {
      field: 'starRating',
      headerName: 'Star Rating',
      width: 100,
      renderCell: (params) => `${params.value} ⭐`,
    },
    {
      field: 'hotelCategoryName',
      headerName: 'Category',
      width: 150,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.row.id)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row.id)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  return (
    <Box className={styles.container}>
      <Paper className={styles.paper}>
        <Box className={styles.header}>
          <Typography variant="h5" component="h1">
            Hotel Master
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddNew}>
            Add New Hotel
          </Button>
        </Box>

        <Box className={styles.searchBar}>
          <TextField
            fullWidth
            placeholder="Search hotels by name, code, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box className={styles.gridContainer}>
          <DataGrid
            rows={hotels}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[10, 25, 50, 100]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            rowCount={total}
            disableRowSelectionOnClick
            autoHeight
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default HotelMaster;