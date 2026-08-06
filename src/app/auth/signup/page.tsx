import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Sign Up - Maison Pasha CRM",
  description: "Create a new Maison Pasha CRM account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900">🏠 Maison Pasha</h1>
            <p className="text-gray-600 mt-2">Join the CRM</p>
          </div>

          {/* Signup Form */}
          <SignupForm />

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> By signing up, you'll have access as a supplier.
              Contact the admin (Patricia) to change your role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
