// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A90E2', // Modern blue
    },
    secondary: {
      main: '#F5A623', // Warm orange
    },
    background: {
      default: '#F4F6F8', // Light gray for a clean look
      paper: '#FFFFFF', // White cards
    },
    text: {
      primary: '#1E1E2F', // Dark for readability
      secondary: '#4F4F4F', // Gray for less important text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12, // Soft, modern rounded edges
  },
});

export default theme;
