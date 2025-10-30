import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Jobs() {
  const jobs = [
    {
      id: 1,
      title: "Frontend Developer Intern",
      company: "TechHub Lesotho",
      requirements: ["React.js", "Firebase", "UI Design"],
    },
    {
      id: 2,
      title: "Software Engineer Graduate",
      company: "Innovate Africa",
      requirements: ["JavaScript", "Node.js", "REST APIs"],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Job Opportunities</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <h3 className="font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.company}</p>
            </CardHeader>
            <CardContent>
              <h4 className="text-sm font-semibold mb-1">Requirements:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 mb-3">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
              <Button size="sm">Apply Now</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
