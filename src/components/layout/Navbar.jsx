import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow">
      <div className="flex items-center gap-2">
        <img src="src/assets/logo.png" alt="NexPath" className="h-8" />
        <span className="text-xl font-semibold">NexPath</span>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/about" className="text-sm font-medium hover:text-primary">
          About
        </Link>
        <Link to="/contact" className="text-sm font-medium hover:text-primary">
          Contact
        </Link>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </nav>
  );
}
