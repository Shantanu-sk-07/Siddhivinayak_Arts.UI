import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import AppRoutes from '@/routes/AppRoutes';
import './index.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#b71c1c',
    },
    secondary: {
      main: '#d32f2f',
    },
    error: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: '"Noto Sans Devanagari", "Segoe UI", "Roboto", sans-serif',
  },
});

function App() {
  return (
      <ThemeProvider theme={theme}>
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
  );
}

export default App;