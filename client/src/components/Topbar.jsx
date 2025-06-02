export default function Topbar({ user }) {
  return (
    <div className="flex justify-between items-center bg-gray-100 px-6 py-4 border-b">
      <span className="font-medium text-lg">{user?.department || "Department"}</span>
      <div className="flex items-center space-x-2">
        <span className="font-semibold">{user?.name || "User"}</span>
        <span className="bg-pink-200 text-pink-800 px-2 py-1 rounded text-xs">{user?.role}</span>
      </div>
    </div>
  );
}
