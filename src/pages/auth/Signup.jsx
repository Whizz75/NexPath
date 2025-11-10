import { SignupForm } from "@/components/signup-form"

export default function SignUp() {
  return (
    <div className="flex min-h-svh w-full bg-slate-950 items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
