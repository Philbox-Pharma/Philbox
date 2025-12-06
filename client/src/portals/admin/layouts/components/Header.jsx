import { useAuth } from "../../../../shared/context/AuthContext";

export default function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h2 className="font-bold text-xl text-blue-600">PhilBox</h2>
      <div className="flex items-center gap-4">
        <span>Hello, {user?.name}</span>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
