export default function AutoRackLogo({ collapsed = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 20L12 4L21 20" />
          <path d="M7 16h10" />
        </svg>
      </div>

      {!collapsed && (
        <div>
          <h2 className="font-bold text-gray-800 text-lg leading-none">
            AutoRack
          </h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
            Seller Portal
          </p>
        </div>
      )}
    </div>
  );
}
