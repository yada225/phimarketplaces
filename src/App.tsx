import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LangLayout from "@/components/LangLayout";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import CompensationPlan from "@/pages/CompensationPlan";
import Kits from "@/pages/Kits";
import ShopPlans from "@/pages/ShopPlans";
import Testimonials from "@/pages/Testimonials";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/fr" replace />} />
          <Route path="/:lang" element={<LangLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:productId" element={<ProductDetail />} />
            <Route path="compensation" element={<CompensationPlan />} />
            <Route path="kits" element={<Kits />} />
            <Route path="shops" element={<ShopPlans />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
