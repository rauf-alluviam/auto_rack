import { FaCartArrowDown } from "react-icons/fa";
import { FaTruck, FaTruckArrowRight } from "react-icons/fa6";
import { IoIosPersonAdd } from "react-icons/io";
import { MdInventory, MdLogout } from "react-icons/md";
import { SiGoogleanalytics } from "react-icons/si";

export default function HomeLayout({
 
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
     
   <header className="w-full bg-white shadow-md border-r border-gray-200 px-10 py-4 flex justify-between items-center">
  <div className="text-2xl font-bold text-black">AUTORACK CONNECT</div>
  
  <nav className="flex space-x-6">
    <a href="#" className="text-gray-700 text-lg hover:text-blue-600 px-3 py-2 rounded-md transition-all">Dashboard</a>
    <a href="#" className="text-gray-700  text-lg hover:text-blue-600 px-3 py-2 rounded-md transition-all">Orders</a>
    <a href="#" className="text-gray-700  text-lg hover:text-blue-600 px-3 py-2 rounded-md transition-all">Transport</a>
    <a href="/logout" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><MdLogout />Logout</a>
  </nav>
</header>

      <div className="flex flex-1">
    
        <aside className="w-64 bg-gray-200 border-r border-black p-6 space-y-6">
          
          
          <ul className="space-y-7 text-black">
         <li> <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><FaCartArrowDown /> Orders</a></li>
            <li><a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><FaTruckArrowRight />Production Tracking</a></li>
            <li><a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><FaTruck />Transport</a></li>
            <li><a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><MdInventory />Inventory</a></li>
            <li><a href="#" className="flex item-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><IoIosPersonAdd />Admin</a></li>
            <li><a href="#" className="flex items-center gap-3 text-gray-700 hover:text-blue-600 text-lg hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200"><SiGoogleanalytics />Reports & Analytics</a></li>
          </ul>
        </aside>

      </div>
       <footer className="flex justify-between items-center bg-white border-t border-gray-300 px-6 py-4 text-sm">
  <span className="text-gray-500"> ©2024 Autorack Connect</span>
  <div className="space-x-4 text-gray-500">
    <a href="#" className="hover:text-blue-600 text-xl">Privacy</a>
    <a href="#" className="hover:text-blue-600 text-xl">Terms of services</a>
  </div>
</footer>

    </div>
    
  );
}
