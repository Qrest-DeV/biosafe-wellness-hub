import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
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
import AdminSlides from "./pages/admin/AdminSlides.tsx";
import AdminCustomers from "./pages/admin/AdminCustomers.tsx";

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
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/slides" element={<AdminSlides />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
