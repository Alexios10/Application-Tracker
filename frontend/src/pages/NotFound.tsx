import { Link } from "react-router-dom";
import { AuthCard } from "@/components/AuthCard";

const NotFound = () => (
  <AuthCard
    title="Siden finnes ikke"
    description="Lenken kan være feil, eller siden kan ha blitt flyttet."
  >
    <Link
      to="/"
      className="text-sm font-medium text-link underline-offset-4 hover:underline"
    >
      Gå til oversikten
    </Link>
  </AuthCard>
);

export default NotFound;
