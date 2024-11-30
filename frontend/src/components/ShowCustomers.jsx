import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Pagination,
  TextField,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const ShowCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]); // State for filtered customers
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 30;
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [openDialog, setOpenDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [openDeleteAllDialog, setOpenDeleteAllDialog] = useState(false); // State for "Delete All" dialog
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/customers");
        setCustomers(data);
        setFilteredCustomers(data); // Initialize filtered customers
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to fetch customers.");
      }
    };
    fetchCustomers();
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = customers.filter((customer) =>
      customer.name.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/customers/${customerToDelete.id}`
      );
      setCustomers(
        customers.filter((customer) => customer.id !== customerToDelete.id)
      );
      setFilteredCustomers(
        filteredCustomers.filter(
          (customer) => customer.id !== customerToDelete.id
        )
      );
      toast.success("Customer deleted successfully.");
      setCustomerToDelete(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer.");
    }
  };

  const handleOpenDialog = (customer) => {
    setCustomerToDelete(customer);
    setOpenDialog(true);
  };

  const handleOpenDeleteAllDialog = () => {
    setOpenDeleteAllDialog(true);
  };

  const handleCloseDialog = () => {
    setCustomerToDelete(null);
    setOpenDialog(false);
  };

  const handleCloseDeleteAllDialog = () => {
    setOpenDeleteAllDialog(false);
  };

  const handleDeleteAllData = async () => {
    try {
      await axios.delete("http://localhost:5000/delete-all-data");
      setCustomers([]); // Clear customers from the frontend
      setFilteredCustomers([]); // Clear filtered customers
      toast.success("All data deleted successfully.");
      setOpenDeleteAllDialog(false);
    } catch (error) {
      console.error("Error deleting all data:", error);
      toast.error("Failed to delete all data.");
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.replace(" ", "T"));
    return date.toLocaleString();
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );

  return (
    <Box p={3}>
      <Box display={"flex"} justifyContent={"space-between"}>
        <Typography variant="h5" gutterBottom>
          All Customers
          {/* <Button
            onClick={handleOpenDeleteAllDialog}
            variant="contained"
            color="secondary"
            sx={{ ml: 3 }}
          >
            Delete All
          </Button> */}
        </Typography>

        {/* Search Input */}
        <TextField
          label="Search Customers"
          variant="outlined"
          // fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ mb: 3,width:"50%" }}
        />
      </Box>

      <List>
        {currentCustomers.map((customer) => (
          <ListItem
            key={customer.id}
            sx={{
              border: "2px solid lightgrey",
              borderRadius: "15px",
              pr: 5,
              pl: 5,
              m: 2,
            }}
          >
            <ListItemText
              primary={customer.name}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    Phone: {customer.phone}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2">
                    Due Payment: {customer?.duePayment?.toFixed(2)}
                  </Typography>
                  <br />
                  <Typography component="span" variant="body2">
                    Added On: {formatTimestamp(customer.timestamp)}
                  </Typography>
                </>
              }
              onClick={() =>
                navigate(`/customers/${customer.id}/history`, {
                  state: customer,
                })
              } // Navigate to history page
            />
          </ListItem>
        ))}
      </List>

      <Pagination
        count={Math.ceil(filteredCustomers.length / customersPerPage)}
        page={currentPage}
        onChange={handlePageChange}
        color="primary"
        sx={{ mt: 3, display: "flex", justifyContent: "center" }}
      />

      {/* Confirmation Dialog for Single Delete */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Customer</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the customer{" "}
            <strong>{customerToDelete?.name}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            No
          </Button>
          <Button
            onClick={handleDeleteCustomer}
            color="secondary"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Delete All */}
      <Dialog
        open={openDeleteAllDialog}
        onClose={handleCloseDeleteAllDialog}
        aria-labelledby="delete-all-dialog-title"
        aria-describedby="delete-all-dialog-description"
      >
        <DialogTitle id="delete-all-dialog-title">Delete All Data</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-all-dialog-description">
            Are you sure you want to delete all data? This action will remove
            all customers, bills, and history records and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteAllDialog} color="primary">
            No
          </Button>
          <Button
            onClick={handleDeleteAllData}
            color="secondary"
            variant="contained"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Box>
  );
};

export default ShowCustomers;
