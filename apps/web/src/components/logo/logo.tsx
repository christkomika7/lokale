import { Link } from "@tanstack/react-router";

export default function Logo() {
  return (
    <Link
      to="/"
      className="tracking-wide shrink-0 font-black text-lg uppercase space-x-px"
    >
      Lokale<span className="text-amber-500 text-3xl font-black">.</span>
    </Link>
  );
}
