import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";

import Dashboard from "./pages/Dashboard.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Subscriptions from "./pages/Subscriptions.tsx";
import Services from "./pages/Services.tsx";
import Aesthetics from "./pages/Aesthetics.tsx";
import Cart from "./pages/Cart.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminCategories from "./pages/admin/AdminCategories.tsx";
import AdminInventory from "./pages/admin/AdminInventory.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminPromoCodes from "./pages/admin/AdminPromoCodes.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.tsx";
import AdminPrescriptions from "./pages/admin/AdminPrescriptions.tsx";
import AdminLabResults from "./pages/admin/AdminLabResults.tsx";
import AdminConsultations from "./pages/admin/AdminConsultations.tsx";
import AdminSlides from "./pages/admin/AdminSlides.tsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.tsx";
import AdminMedia from "./pages/admin/AdminMedia.tsx";
import AdminStaff from "./pages/admin/AdminStaff.tsx";
import AdminAuditLog from "./pages/admin/AdminAuditLog.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/services" element={<Services />} />
              <Route path="/aesthetics" element={<Aesthetics />} />
              <Route path="/cart" element={<Cart />} />
              
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/promo-codes" element={<AdminPromoCodes />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
              <Route path="/admin/prescriptions" element={<AdminPrescriptions />} />
              <Route path="/admin/lab-results" element={<AdminLabResults />} />
              <Route path="/admin/consultations" element={<AdminConsultations />} />
              <Route path="/admin/slides" element={<AdminSlides />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/media" element={<AdminMedia />} />
              <Route path="/admin/staff" element={<AdminStaff />} />
              <Route path="/admin/audit-log" element={<AdminAuditLog />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
