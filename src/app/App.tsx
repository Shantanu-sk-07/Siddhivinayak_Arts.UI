import * as React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppRoutes from '@/routes/AppRoutes';
import { SnackbarProvider } from '@/components/controlled/SnackbarProvider';

const App: React.FC = () => {
  return (
    <SnackbarProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
