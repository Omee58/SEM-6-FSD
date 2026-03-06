import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 rounded-3xl bg-[#FCE7F3] flex items-center justify-center mx-auto mb-8">
        <Heart size={48} className="text-[#BE185D]" />
      </div>
      <div className="text-8xl font-bold text-[#BE185D] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>404</div>
      <h1 className="text-2xl font-bold text-[#1A1A18] mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
        Page Not Found
      </h1>
      <p className="text-[#6B6B65] mb-8 max-w-sm">
        Looks like this page has been taken to the mandap already. Let's get you back on track.
      </p>
      <Link to="/">
        <Button size="lg">
          <Home size={18} />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
