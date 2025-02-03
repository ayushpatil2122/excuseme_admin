import { ArrowLeft, Clock, History, Home, Phone, Receipt, Users } from 'lucide-react'
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-4">
      {/* Left section */}
      <div className="flex items-center gap-6">
        <button className="hover:opacity-70">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin Panel</h1>
            <p className="text-sm text-gray-500">Hotel Jagdamb</p>
          </div>
        </div>
      </div>

      {/* Center navigation */}
      <nav className="flex items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-orange-500"
        >
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/History"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <History className="h-5 w-5" />
          <span>History</span>
        </Link>
        <Link
          href="/Staff"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900"
        >
          <Users className="h-5 w-5" />
          <span>Staff</span>
        </Link>
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-6">
        <span className="text-orange-500">Dinning option</span>
        <div className="flex items-center gap-2 text-gray-500">
          <Phone className="h-5 w-5" />
          <span>+91 9423515112</span>
        </div>
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

