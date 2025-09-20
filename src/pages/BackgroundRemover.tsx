import Header from '../components/Header';
import Footer from '../components/Footer';
import BackgroundRemover from '../components/BackgroundRemover';

const BackgroundRemoverPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <BackgroundRemover />
      </main>

      <Footer />
    </div>
  );
};

export default BackgroundRemoverPage;