import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Applications() {
  const applications = [
    {
      id: 1,
      institution: "Limkokwing University",
      course: "Software Engineering",
      status: "Pending",
    },
    {
      id: 2,
      institution: "NUL",
      course: "Computer Science",
      status: "Admitted",
    },
  ];

  const statusColor = {
    Pending: "text-yellow-600",
    Admitted: "text-green-600",
    Rejected: "text-red-600",
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Applications</h2>
      <div className="grid gap-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <h3 className="font-semibold">{app.course}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-1">
                Institution: {app.institution}
              </p>
              <p className={`text-sm mb-2 ${statusColor[app.status]}`}>
                Status: {app.status}
              </p>
              {app.status === "Admitted" && (
                <Button variant="outline" size="sm">
                  Accept Admission
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
