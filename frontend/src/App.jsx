import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import AddCustomer from './components/AddCustomer';
import ShowCustomers from './components/ShowCustomers';
import TodaysBills from './components/TodaysBills';
import AllBills from './components/AllBills';
import DetailedBill from './components/DetailedBill';
import CustomerHistory from './components/CustomerHistory';
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex', height: '100vh', background: 'linear-gradient(120deg, #4A90E2, #F5A623)' }}>
          {/* Sidebar Drawer */}
          <Drawer
  variant="permanent"
  sx={{
    width: 140, // Updated width to half of 280px
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: 140, // Updated width to half of 280px
      boxSizing: 'border-box',
      background: '#1E1E2F',
      color: '#FFF',
    },
  }}
>
  <Toolbar>
    <Typography
      variant="h6"
      sx={{
        color: '#F5A623',
        fontWeight: 700,
        fontSize: '1rem', // Adjust font size to fit the smaller width
        textAlign: 'center', // Center-align text
        width: '100%', // Ensure text stays within the sidebar
      }}
    >
      Admin
    </Typography>
  </Toolbar>
  <Box sx={{ overflow: 'auto' }}>
    <List>
      <ListItem button component={Link} to="/add-customer" sx={{ '&:hover': { backgroundColor: '#333' } }}>
        <ListItemText
          primary="Add Customer"
          primaryTypographyProps={{ fontSize: '0.9rem' }} // Adjust text size for smaller width
        />
      </ListItem>
      <ListItem button component={Link} to="/show-customers" sx={{ '&:hover': { backgroundColor: '#333' } }}>
        <ListItemText
          primary="Show Customers"
          primaryTypographyProps={{ fontSize: '0.9rem' }} // Adjust text size for smaller width
        />
      </ListItem>
      <ListItem button component={Link} to="/todays-bills" sx={{ '&:hover': { backgroundColor: '#333' } }}>
        <ListItemText
          primary="Today's Bills"
          primaryTypographyProps={{ fontSize: '0.9rem' }} // Adjust text size for smaller width
        />
      </ListItem>
      <ListItem button component={Link} to="/all-bills" sx={{ '&:hover': { backgroundColor: '#333' } }}>
        <ListItemText
          primary="All Bills"
          primaryTypographyProps={{ fontSize: '0.9rem' }} // Adjust text size for smaller width
        />
      </ListItem>
    </List>
  </Box>
</Drawer>


          {/* Main Content */}
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: 'background.default', p: 1, overflowY: 'auto' }}
          >
            <Toolbar />
            <Routes>
            <Route
                path="/"
                element={
                  <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
                    <CardContent>
                      <AddCustomer />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/add-customer"
                element={
                  <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
                    <CardContent>
                      <AddCustomer />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/show-customers"
                element={
                  <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
                    <CardContent>
                      <ShowCustomers />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/todays-bills"
                element={
                  <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 1, p: 2 }}>
                    <CardContent>
                      <TodaysBills />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/bill/:date"
                element={
                  <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 1, p: 2 }}>
                    <CardContent>
                      <DetailedBill />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/all-bills"
                element={
                  <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
                    <CardContent>
                      <AllBills />
                    </CardContent>
                  </Card>
                }
              />
              <Route
                path="/customers/:id/history"
                element={
                  <Card sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
                    <CardContent>
                      <CustomerHistory />
                    </CardContent>
                  </Card>
                }
              />
            </Routes>
            
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
