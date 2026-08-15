import { getSession } from "@/lib/session";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Account</h1>
      <p className="text-sm text-gray-500 mb-6">
        Signed in as {session && "username" in session ? session.username : ""}
      </p>

      <div className="max-w-sm">
        <h2 className="text-sm font-medium mb-3">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
