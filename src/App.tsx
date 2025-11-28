import './i18n/config';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
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
import ShapeSeriesApp from "./pages/ShapeSeriesApp";
import FractionShapesApp from "./pages/FractionShapesApp";
import FlowerMathApp from "./pages/FlowerMathApp";
import BalloonMathApp from "./pages/BalloonMathApp";
import BackgroundRemoverPage from "./pages/BackgroundRemover";
import ParentDashboard from "./pages/ParentDashboard";
import ChildProgressDashboard from "./pages/ChildProgressDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import AIMathTutor from "./pages/AIMathTutor";
import AdaptiveLearningPath from "./pages/AdaptiveLearningPath";
import NumberBondsApp from "./pages/NumberBondsApp";
import BarModelApp from "./pages/BarModelApp";
import MoneyApp from "./pages/MoneyApp";
import PlaceValueApp from "./pages/PlaceValueApp";
import MentalMathApp from "./pages/MentalMathApp";
import AreaModelApp from "./pages/AreaModelApp";
import WordProblemsApp from "./pages/WordProblemsApp";
import STEMHub from "./pages/STEMHub";
import CodingBasicsApp from "./pages/CodingBasicsApp";
import ScienceLabApp from "./pages/ScienceLabApp";
import EngineeringChallengesApp from "./pages/EngineeringChallengesApp";
import PhysicsLabApp from "./pages/PhysicsLabApp";
import ChemistryLabApp from "./pages/ChemistryLabApp";
import BiologyLabApp from "./pages/BiologyLabApp";
import AstronomyLabApp from "./pages/AstronomyLabApp";
import STEMProgressDashboard from "./pages/STEMProgressDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import QuestionBank from "./pages/QuestionBank";
import TrainingCalendar from "./pages/TrainingCalendar";
import TodayFocusMode from "./pages/TodayFocusMode";
import WeeklyProgressReport from "./pages/WeeklyProgressReport";
import MissionHistory from "./pages/MissionHistory";
import SkillProgressTracking from "./pages/SkillProgressTracking";
import AdminQuestionBank from "./pages/AdminQuestionBank";
import TagManagement from "./pages/TagManagement";
import PublicExam from "./pages/PublicExam";
import StudentExamResult from "./pages/StudentExamResult";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import TeacherProtectedRoute from "./components/TeacherProtectedRoute";
import { ToastContainer } from "./components/Toast";
import { PWAUpdatePrompt } from "./components/PWAUpdatePrompt";

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
            path="/quiz" 
            element={
              <ProtectedRoute>
                <Quiz />
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
          <Route
            path="/parent/progress" 
            element={
              <ProtectedRoute>
                <ChildProgressDashboard />
              </ProtectedRoute>
            } 
          />
          {/* Public view for progress (token-based from LINE) */}
          <Route path="/view-progress" element={<ChildProgressDashboard />} />
          <Route
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/stem" 
            element={
              <ProtectedRoute>
                <STEMHub />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/training-calendar" 
            element={
              <ProtectedRoute>
                <TrainingCalendar />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/today-mission" 
            element={
              <ProtectedRoute>
                <TodayFocusMode />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/weekly-progress" 
            element={
              <ProtectedRoute>
                <WeeklyProgressReport />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/mission-history" 
            element={
              <ProtectedRoute>
                <MissionHistory />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/skill-progress" 
            element={
              <ProtectedRoute>
                <SkillProgressTracking />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/question-bank" 
            element={
              <AdminProtectedRoute>
                <AdminQuestionBank />
              </AdminProtectedRoute>
            } 
          />
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
            path="/number-series" 
            element={
              <ProtectedRoute>
                <NumberSeriesApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sum-grid" 
            element={
              <ProtectedRoute>
                <SumGridPuzzles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shape-series" 
            element={
              <ProtectedRoute>
                <ShapeSeriesApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fraction-shapes" 
            element={
              <ProtectedRoute>
                <FractionShapesApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/flower-math" 
            element={
              <ProtectedRoute>
                <FlowerMathApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/balloon-math" 
            element={
              <ProtectedRoute>
                <BalloonMathApp />
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
          <Route 
            path="/word-problems" 
            element={
              <ProtectedRoute>
                <WordProblemsApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coding-basics" 
            element={
              <ProtectedRoute>
                <CodingBasicsApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/science-lab" 
            element={
              <ProtectedRoute>
                <ScienceLabApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/engineering-challenges" 
            element={
              <ProtectedRoute>
                <EngineeringChallengesApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/physics-lab" 
            element={
              <ProtectedRoute>
                <PhysicsLabApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chemistry-lab" 
            element={
              <ProtectedRoute>
                <ChemistryLabApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/biology-lab" 
            element={
              <ProtectedRoute>
                <BiologyLabApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/astronomy-lab" 
            element={
              <ProtectedRoute>
                <AstronomyLabApp />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stem-progress" 
            element={
              <ProtectedRoute>
                <STEMProgressDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Teacher Routes */}
          <Route 
            path="/teacher" 
            element={
              <TeacherProtectedRoute>
                <TeacherDashboard />
              </TeacherProtectedRoute>
            } 
          />
          
          <Route 
            path="/teacher/question-bank" 
            element={
              <TeacherProtectedRoute>
                <QuestionBank />
              </TeacherProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/tags" 
            element={
              <AdminProtectedRoute>
                <TagManagement />
              </AdminProtectedRoute>
            } 
          />
          
          {/* Public Exam Route - No authentication required */}
          <Route path="/exam/:linkCode" element={<PublicExam />} />
          
          {/* Exam Result Route - No authentication required */}
          <Route path="/exam-result/:sessionId" element={<StudentExamResult />} />
          
          <Route path="/background-remover" element={<BackgroundRemoverPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* PWA Update Prompt */}
        <PWAUpdatePrompt />
        
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
