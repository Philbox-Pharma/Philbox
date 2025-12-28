import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './shared/context/AuthContext';
import AppRoutes from './core/routing/Routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
