import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function Register() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">Create your NexPath account</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input placeholder="Full Name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button className="w-full">Register</Button>
        </CardContent>
      </Card>
    </div>
  );
}
