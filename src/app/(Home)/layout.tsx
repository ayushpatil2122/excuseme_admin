import AdminPanelLayout from "@/components/AdminPanelLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminPanelLayout>
        {children}
    </AdminPanelLayout>
  );
}
