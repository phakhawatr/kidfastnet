import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-16 py-12">
      <div className="container mx-auto px-4 text-center">
        {/* CTA Button */}
        <div className="mb-8">
          <Link 
            to="/signup" 
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            🚀 เริ่มเรียนเลย! ฟรี!
          </Link>
        </div>

        {/* Links */}
        <div className="text-white/80 text-sm space-y-2">
          <p>❤️ ทดลองใช้ฟรี 7 วัน ไม่ต้องใส่บัตรเครดิต! ❤️</p>
          <p>© 2025 KidFast.net - พัฒนาโดยทีมที่รักเด็กและอยากให้เก่ง ❤️</p>
          <p>ติดต่อเราที่ <a href="mailto:hello@kidfast.net" className="text-white hover:underline">hello@kidfast.net</a> 📧</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;