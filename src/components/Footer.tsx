import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="mt-16 py-12">
      <div className="container mx-auto px-4 text-center">
        {/* CTA Button */}
        

        {/* Links */}
        <div className="text-white/80 text-sm space-y-2">
          
          <p>© 2025 KidFast.net - พัฒนาโดยทีมที่รักเด็กและอยากให้เก่ง ❤️</p>
          <p>ติดต่อเราที่ <a href="#" className="text-white hover:underline">LINE OA @kidfast</a> 💬</p>
        </div>
      </div>
    </footer>;
};
export default Footer;