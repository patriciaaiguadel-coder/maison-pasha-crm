import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Sign In - Maison Pasha CRM",
  description: "Sign in to your Maison Pasha CRM account",
};

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-900">🏠 Maison Pasha</h1>
            <p className="text-gray-600 mt-2">CRM Management System</p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Info Box */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-900">
              <strong>Demo Account:</strong>
              <br />
              Email: patricia@maison-pasha.com
              <br />
              Password: admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
