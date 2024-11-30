import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
} from '@mui/material';

const CustomerHistory = () => {
  const location = useLocation();
  const customer = location.state; // Extract the customer object from location.state
  let history = customer?.history || []; // Extract the history key

  // Parse history if it's a string
  if (typeof history === 'string') {
    try {
      history = JSON.parse(history); // Parse the stringified JSON
    } catch (error) {
      console.error('Error parsing history:', error);
      history = []; // Fallback to empty array
    }
  }

  // Ensure history is an array
  if (!Array.isArray(history)) {
    history = [];
  }

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom textAlign={"center"}>
        Momin Chicken Suppliers
      </Typography>
      <Box display={"flex"} gap={9}>
      <Typography variant="h6" gutterBottom textAlign={"center"} mt={2} mb={2}>
        Address: <Typography fontSize={"16px"} display={"inline"}>68|6, Hajaremala,umbraj.Tal-karad,dist-satara,415109</Typography>
      </Typography>
      <Typography variant="h6" gutterBottom textAlign={"center"}  mt={2} mb={2}>
        Prop: <Typography fontSize={"16px"} display={"inline"}>Late H.shabbir A. Momin and sons</Typography>
        <Typography variant="h6">Contact No.- <Typography display={"inline"}>9850697429 , 9970772324</Typography></Typography>
      </Typography>
      </Box>
      <Typography variant="h5" gutterBottom>
        History for {customer.name}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Phone: {customer.phone}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Due Payment: {customer.duePayment.toFixed(2)}
      </Typography>

      {/* History Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Quantity</strong></TableCell>
              <TableCell><strong>Weight</strong></TableCell>
              <TableCell><strong>Rate</strong></TableCell>
              <TableCell><strong>Payment</strong></TableCell>
              <TableCell><strong>Due Payment</strong></TableCell>
              <TableCell><strong>Total Payment</strong></TableCell>
              <TableCell><strong>Credit Payment</strong></TableCell>
              <TableCell><strong>Total Due Payment</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.quantity}</TableCell>
                <TableCell>{entry.weight}</TableCell>
                <TableCell>{entry.rate}</TableCell>
                <TableCell>{entry.payment}</TableCell>
                <TableCell>{entry.duePayment}</TableCell>
                <TableCell>{entry.totalPayment}</TableCell>
                <TableCell>{entry.creditPayment}</TableCell>
                <TableCell>{entry.totalDuePayment}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CustomerHistory;
