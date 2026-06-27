import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import { Navbar } from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import ContactPage from './pages/ContactPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AccountPage from './pages/AccountPage';
import MyOrdersPage from './pages/MyOrdersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffPortal from './pages/staff/StaffPortal';
import './App.css';

// Public layout: navbar + footer chrome around the storefront pages.
function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ProductsProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/menu/:productId" element={<ProductDetail />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/track" element={<TrackOrderPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/orders" element={<MyOrdersPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']} title="Aroma Admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute roles={['admin', 'employee']} title="Aroma Staff">
                    <StaffPortal />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#422006',
                  color: '#fde68a',
                  border: '1px solid #92400e',
                },
              }}
            />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
