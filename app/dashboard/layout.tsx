import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/DashboardSidebar";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgoundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    Vue: "Compass",
    Hono: "FlameIcon",
    Angular: "Terminal",
  };

  const formattedPlaygroundData = playgoundData?.map((item) => ({
    id: item.id,
    name: item.title,
    starred: Boolean,
    icon: technologyIconMap[item.template] || "Code 2",
  }));
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/*@ts-ignore*/}
        <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
