import HomeContainer from "@/components/home/HomeContainer";
import OverdueNotification from "@/components/task/overdue-task-notification";

export default function Home() {
  return (
    <main
      className={`flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full theme-transition`}
    >
      <OverdueNotification />
      <HomeContainer />
    </main>
  );
}
