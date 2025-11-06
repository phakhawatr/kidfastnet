import './i18n/config';
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
import MultiplicationApp from "./pages/MultiplicationApp";
import DivisionApp from "./pages/DivisionApp";
import QuickMathApp from "./pages/QuickMathApp";
import LengthComparisonApp from "./pages/LengthComparisonApp";
import ShapeMatchingApp from "./pages/ShapeMatchingApp";
import FractionMatchingApp from "./pages/FractionMatchingApp";
import PercentageApp from "./pages/PercentageApp";
import NumberSeriesApp from "./pages/NumberSeriesApp";
import SumGridPuzzles from "./pages/SumGridPuzzles";
import BackgroundRemoverPage from "./pages/BackgroundRemover";
import ParentDashboard from "./pages/ParentDashboard";
import AIMathTutor from "./pages/AIMathTutor";
import AdaptiveLearningPath from "./pages/AdaptiveLearningPath";
import NumberBondsApp from "./pages/NumberBondsApp";
import BarModelApp from "./pages/BarModelApp";
import MoneyApp from "./pages/MoneyApp";
import PlaceValueApp from "./pages/PlaceValueApp";
import MentalMathApp from "./pages/MentalMathApp";
import AreaModelApp from "./pages/AreaModelApp";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { ToastContainer } from "./components/Toast";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
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
          <Route 
            path="/parent" 
            element={
              <ProtectedRoute>
                <ParentDashboard />
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
            path="/multiply" 
            element={
              <ProtectedRoute>
                <MultiplicationApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/division" 
            element={
              <ProtectedRoute>
                <DivisionApp />
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
          <Route 
            path="/percentage" 
            element={
              <ProtectedRoute>
                <PercentageApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/NumberSeries" 
            element={
              <ProtectedRoute>
                <NumberSeriesApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/SumGridPuzzles" 
            element={
              <ProtectedRoute>
                <SumGridPuzzles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ai-math-tutor" 
            element={
              <ProtectedRoute>
                <AIMathTutor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/adaptive-learning" 
            element={
              <ProtectedRoute>
                <AdaptiveLearningPath />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/number-bonds"
            element={
              <ProtectedRoute>
                <NumberBondsApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bar-model" 
            element={
              <ProtectedRoute>
                <BarModelApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/place-value" 
            element={
              <ProtectedRoute>
                <PlaceValueApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mental-math" 
            element={
              <ProtectedRoute>
                <MentalMathApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/area-model" 
            element={
              <ProtectedRoute>
                <AreaModelApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/money" 
            element={
              <ProtectedRoute>
                <MoneyApp />
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
};

export default App;
