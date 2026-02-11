import React, { useEffect, useState } from 'react';
import { DataGrid } from '@/components/common/DataGrid';
import type { Column } from '@/components/common/DataGrid';
import { countryService } from '@/services/master/country.service';
import type { Country } from '@/services/master/country.models';

const CountryMaster: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const response = await countryService.getAll({ pageSize: 1000 });
      setCountries(response.data);
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<Country>[] = [
    { key: 'countryCode', label: 'Country Code', sortable: true },
    { key: 'countryName', label: 'Country Name', sortable: true },
    { key: 'isoCode2', label: 'ISO Code 2', sortable: true },
    { key: 'isoCode3', label: 'ISO Code 3', sortable: true },
    { key: 'phoneCode', label: 'Phone Code', sortable: true },
    { key: 'region', label: 'Region', sortable: true },
    { key: 'continent', label: 'Continent', sortable: true },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (country) => (
        <span style={{ color: country.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
          {country.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleViewMore = (country: Country) => {
    console.log('View more:', country);
    // Open edit modal or navigate to edit page
  };

  return (
    <div style={{ padding: '2rem' }}>
      <DataGrid
        title="Country Master"
        data={countries}
        columns={columns}
        onViewMore={handleViewMore}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CountryMaster;