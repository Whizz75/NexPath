import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Institutions() {
  const institutions = [
    { id: 1, name: "Limkokwing University", courses: 45 },
    { id: 2, name: "National University of Lesotho", courses: 38 },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Available Institutions</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map((inst) => (
          <Card key={inst.id}>
            <CardHeader>
              <h3 className="font-semibold">{inst.name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Courses Offered: {inst.courses}
              </p>
              <Button>View Courses</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
