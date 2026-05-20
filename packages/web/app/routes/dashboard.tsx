import { m } from "@/paraglide/messages";

export default function Dashboard()
{
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{ m.dashboard_welcome() }</h1>
        <p className="text-lg text-muted-foreground">{ m.dashboard_description() }</p>
      </div>
    );
}
