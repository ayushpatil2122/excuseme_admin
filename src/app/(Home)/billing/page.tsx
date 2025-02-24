import PaymentHistory from "@/components/PaymentHistory";

export default function () {
    return  <div className="flex h-screen bg-gray-100">
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <PaymentHistory />
      </main>
    </div>
  </div>
}