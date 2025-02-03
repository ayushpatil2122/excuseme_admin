import { Card } from "@/components/ui/card"
import { Button } from "./ui/button"
import Link from "next/link"
  
export default function History() {
    return (
      <>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Table 1</h3>
            <p className="text-sm text-gray-500">history entries</p>
            <Link href="/History/1">
              <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                View
              </Button>
            </Link>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Table 2</h3>
            <p className="text-sm text-gray-500">history entries</p>
            <Link href="/History/2">
              <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                View
              </Button>
            </Link>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Table 3</h3>
            <p className="text-sm text-gray-500">history entries</p>
            <Link href="/History/3">
              <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                View
              </Button>
            </Link>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">Table 4</h3>
            <p className="text-sm text-gray-500">history entries</p>
            <Link href="/History/4">
              <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                View
              </Button>
            </Link>
          </Card>
        </div>
      </>
    )
  }
  
  