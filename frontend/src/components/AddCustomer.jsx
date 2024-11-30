import React, { useState } from 'react'; // Import React and useState
import { TextField, Button, Typography, Box } from '@mui/material'; // Import MUI components
import axios from 'axios'; // Import Axios for API calls
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify styles

const AddCustomer = () => {
  const [customer, setCustomer] = useState({ name: '', phone: '', duePayment: '' }); // State for customer details

  const handleAddCustomer = async () => {
    try {
      // Send customer data to the backend
      const response = await axios.post('http://localhost:5000/customers', customer);
      // Show success toast
      toast.success(`Customer Added: ${customer.name}`);
      // Reset customer state
      setCustomer({ name: '', phone: '', duePayment: '' });
    } catch (error) {
      // Show error toast
      toast.error(`Error: ${error.message}`);
      console.error('Error adding customer:', error.message); // Handle error
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Add New Customer
      </Typography>
      <TextField
        label="Customer Name"
        value={customer.name}
        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <TextField
        label="Phone Number"
        value={customer.phone}
        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
      />
      <TextField
        label="Due Payment"
        type="number"
        value={customer.duePayment}
        onChange={(e) => setCustomer({ ...customer, duePayment: e.target.value })}
        fullWidth
        margin="normal"
        variant="outlined"
        InputProps={{
          inputProps: { style: { appearance: 'textfield' } }, // Disable spinner buttons
        }}
        sx={{
          '& input[type=number]::-webkit-inner-spin-button': { display: 'none' }, // Remove spinner for Chrome
          '& input[type=number]::-webkit-outer-spin-button': { display: 'none' }, // Remove spinner for Chrome
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddCustomer}
        sx={{
          mt: 2,
          bgcolor: 'secondary.main',
          '&:hover': {
            bgcolor: 'primary.main',
          },
        }}
      >
        Add Customer
      </Button>

      {/* Toast container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000} // Auto close after 3 seconds
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Box>
  );
};

export default AddCustomer; // Export the component
