import React, { useState } from 'react';
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
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  // State for date inputs and dialog
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Function to filter and download PDF
  const handleDownload = () => {
    // Parse dates for filtering
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filter history based on dates
    const filteredHistory = history.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    // Generate PDF
    const doc = new jsPDF();
    doc.text('Momin Chicken Suppliers', 14, 10);
    doc.text('Address: 68|6, Hajaremala, umbraj. Tal-karad, dist-satara, 415109', 14, 20);
    doc.text('Contact No. 9850697429 , 9970772324', 14, 30);
    // 
    doc.text(`History for ${customer.name}`, 14, 40);
    doc.text(`Phone: ${customer.phone}`, 14, 50);
    doc.text(`Due Payment: ${customer.duePayment.toFixed(2)}`, 14, 60);
    doc.autoTable({
      startY: 70,
      head: [
        [
          'Date',
          'Quantity',
          'Weight',
          'Rate',
          'Payment',
          'Due Payment',
          'Total Payment',
          'Credit Payment',
          'Total Due Payment',
        ],
      ],
      body: filteredHistory.map((entry) => [
        entry.date,
        entry.quantity,
        entry.weight,
        entry.rate,
        entry.payment,
        entry.duePayment,
        entry.totalPayment,
        entry.creditPayment,
        entry.totalDuePayment,
      ]),
    });
    doc.save(`Customer_History_${customer.name}.pdf`);
    setOpen(false); // Close the dialog
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom textAlign={'center'}>
        Momin Chicken Suppliers
      </Typography>
      <Box display={'flex'} gap={9}>
        <Typography variant="h6" gutterBottom textAlign={'center'} mt={2} mb={2}>
          Address:{' '}
          <Typography fontSize={'16px'} display={'inline'}>
            68|6, Hajaremala, umbraj. Tal-karad, dist-satara, 415109
          </Typography>
        </Typography>
        <Typography variant="h6" gutterBottom textAlign={'center'} mt={2} mb={2}>
          Prop:{' '}
          <Typography fontSize={'16px'} display={'inline'}>
            Late H.shabbir A. Momin and sons
          </Typography>
          <Typography variant="h6">
            Contact No.-{' '}
            <Typography display={'inline'}>9850697429 , 9970772324</Typography>
          </Typography>
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
              <TableCell>
                <strong>Date</strong>
              </TableCell>
              <TableCell>
                <strong>Quantity</strong>
              </TableCell>
              <TableCell>
                <strong>Weight</strong>
              </TableCell>
              <TableCell>
                <strong>Rate</strong>
              </TableCell>
              <TableCell>
                <strong>Payment</strong>
              </TableCell>
              <TableCell>
                <strong>Due Payment</strong>
              </TableCell>
              <TableCell>
                <strong>Total Payment</strong>
              </TableCell>
              <TableCell>
                <strong>Credit Payment</strong>
              </TableCell>
              <TableCell>
                <strong>Total Due Payment</strong>
              </TableCell>
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

      {/* Download Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => setOpen(true)}
      >
        Download PDF
      </Button>

      {/* Date Input Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Download Filtered History</DialogTitle>
        <DialogContent>
          <TextField
            label="Start Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="End Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDownload} variant="contained" color="primary">
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerHistory;
