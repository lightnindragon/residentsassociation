import { ForumLayoutWrapper } from "@/components/ForumLayoutWrapper";
import { ForumSidebar } from "@/components/ForumSidebar";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ForumLayoutWrapper sidebar={<ForumSidebar />}>
      {children}
    </ForumLayoutWrapper>
  );
}
