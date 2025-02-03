"use client"

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHatIcon as Chef, UserCog, UserCheck } from 'lucide-react'

interface StaffMember {
  name: string
  role: "Chef" | "Waiter" | "Manager"
  joinDate: string
  imageUrl: string
}

const staffMembers: StaffMember[] = [
  { name: "name 1", role: "Chef", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
  { name: "name 2", role: "Waiter", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
  { name: "name 3", role: "Manager", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
  { name: "name 4", role: "Chef", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
  { name: "name 5", role: "Waiter", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
  { name: "name 6", role: "Manager", joinDate: "11-11-2003", imageUrl: "/placeholder.svg?height=100&width=100" },
]

const getRoleIcon = (role: StaffMember["role"]) => {
  switch (role) {
    case "Chef":
      return <Chef className="h-6 w-6" />
    case "Waiter":
      return <UserCheck className="h-6 w-6" />
    case "Manager":
      return <UserCog className="h-6 w-6" />
  }
}

export default function Staff() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Restaurant Staff</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffMembers.map((staff, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={staff.imageUrl}
                  alt={`${staff.name}'s profile picture`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div>
                <CardTitle>{staff.name}</CardTitle>
                <div className="flex items-center mt-1">
                  {getRoleIcon(staff.role)}
                  <span className="ml-2 text-sm text-gray-500">{staff.role}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Date of join: {staff.joinDate}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

