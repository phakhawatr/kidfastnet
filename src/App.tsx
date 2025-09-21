import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import SubtractionApp from "./pages/SubtractionApp";
import AdditionApp from "./pages/AdditionApp";
import TimeApp from "./pages/TimeApp";
import WeighingApp from "./pages/WeighingApp";
import MeasurementApp from "./pages/MeasurementApp";
import MultiplicationTable from "./pages/MultiplicationTable";
import QuickMathApp from "./pages/QuickMathApp";
import LengthComparisonApp from "./pages/LengthComparisonApp";
import ShapeMatchingApp from "./pages/ShapeMatchingApp";
import FractionMatchingApp from "./pages/FractionMatchingApp";
import BackgroundRemoverPage from "./pages/BackgroundRemover";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { ToastContainer } from "./components/Toast";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route 
          path="/subtraction" 
          element={
            <ProtectedRoute>
              <SubtractionApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/addition" 
          element={
            <ProtectedRoute>
              <AdditionApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/time" 
          element={
            <ProtectedRoute>
              <TimeApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/weighing" 
          element={
            <ProtectedRoute>
              <WeighingApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/measurement" 
          element={
            <ProtectedRoute>
              <MeasurementApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/multiplication-table" 
          element={
            <ProtectedRoute>
              <MultiplicationTable />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/quick-math" 
          element={
            <ProtectedRoute>
              <QuickMathApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/length-comparison" 
          element={
            <ProtectedRoute>
              <LengthComparisonApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shape-matching" 
          element={
            <ProtectedRoute>
              <ShapeMatchingApp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fraction-matching" 
          element={
            <ProtectedRoute>
              <FractionMatchingApp />
            </ProtectedRoute>
          } 
        />
        <Route path="/background-remover" element={<BackgroundRemoverPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
