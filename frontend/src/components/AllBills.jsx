import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  TextField,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AllBills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]); // State for filtered bills
  const [currentPage, setCurrentPage] = useState(1);
  const billsPerPage = 30; // Number of bills per page
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await axios.get('http://localhost:5000/bills');
        const data = response.data;

        // Filter to keep only the newest bill for each date
        const uniqueBills = Object.values(
          data.reduce((acc, bill) => {
            if (
              !acc[bill.date] || 
              new Date(bill.createdAt) > new Date(acc[bill.date].createdAt)
            ) {
              acc[bill.date] = bill; // Keep the most recent bill
            }
            return acc;
          }, {})
        );

        setBills(uniqueBills);
        setFilteredBills(uniqueBills); // Initialize filtered bills
      } catch (error) {
        console.error('Error fetching bills:', error);
      }
    };
    fetchBills();
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = bills.filter((bill) =>
      bill.date.toLowerCase().includes(query)
    );
    setFilteredBills(filtered);
    setCurrentPage(1); // Reset to the first page on new search
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastBill = currentPage * billsPerPage;
  const indexOfFirstBill = indexOfLastBill - billsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstBill, indexOfLastBill);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        All Bills
      </Typography>

      {/* Search Input */}
      <TextField
        label="Search Bills by Date"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />

      <List>
        {currentBills.map((bill) => (
          <ListItem
            key={bill.id}
            button
            onClick={() => navigate(`/bill/${bill.date}`)}
            sx={{ '&:hover': { backgroundColor: '#f0f0f0' } }}
          >
            <ListItemText primary={`Bill Date: ${bill.date}`} />
          </ListItem>
        ))}
      </List>

      {/* Pagination */}
      <Pagination
        count={Math.ceil(filteredBills.length / billsPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}
      />
    </Box>
  );
};

export default AllBills;
