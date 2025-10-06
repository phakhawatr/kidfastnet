import { Link } from 'react-router-dom';
const Footer = () => {
  return <footer className="mt-16 py-12">
      <div className="container mx-auto px-4 text-center">
        {/* CTA Button */}
        

        {/* Links */}
        <div className="text-white/80 text-sm space-y-2">
          
          <p>© 2025 KidFast.net - พัฒนาโดยทีมที่รักเด็กและอยากให้เก่ง ❤️</p>
          <p>ติดต่อเราที่ <a href="https://lin.ee/hFVAoTI" className="inline-block align-middle"><img src="https://scdn.line-apps.com/n/line_add_friends/btn/th.png" alt="เพิ่มเพื่อน" className="inline-block h-6 w-auto" /></a> 💬</p>
        </div>
      </div>
    </footer>;
};
export default Footer;