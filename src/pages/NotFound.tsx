import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card-glass p-8 text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">🤔</div>
          <h1 className="text-4xl font-bold mb-4 text-[hsl(var(--text-primary))]">หน้าที่หาไม่เจอ</h1>
          <p className="text-lg text-[hsl(var(--text-secondary))] mb-6">
            อุ๊ปส์! หน้าที่คุณต้องการไม่มีอยู่
          </p>
          <Link 
            to="/" 
            className="btn-primary inline-flex items-center gap-2"
          >
            🏠 กลับหน้าแรก
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
