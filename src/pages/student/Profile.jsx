import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Profile() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
      <Card className="max-w-xl">
        <CardHeader>
          <h3 className="font-semibold">Personal Information</h3>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Full Name" />
          <Input placeholder="Email Address" type="email" />
          <Input placeholder="Phone Number" />
          <Input type="file" />
          <Button className="mt-2">Update Profile</Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="font-semibold mb-3">Academic Documents</h3>
        <Card className="max-w-xl">
          <CardContent className="flex flex-col gap-3 py-4">
            <Input type="file" />
            <Input type="file" />
            <Button variant="outline">Upload Transcripts</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
