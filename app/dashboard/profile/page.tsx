import { db } from "@/lib/db";
import { requireAuth } from "@/lib/session";
import { addAddressAction, deleteAddressAction, updateProfileAction } from "@/actions/profile";
import { changePasswordAction } from "@/actions/auth";
import Card from "@/components/ui/Card";
import SubmitButton from "@/components/forms/SubmitButton";

export const metadata = { title: "Account" };

async function updateProfile(formData: FormData) {
  "use server";
  await updateProfileAction(formData);
}

async function changePassword(formData: FormData) {
  "use server";
  await changePasswordAction(formData);
}

async function addAddress(formData: FormData) {
  "use server";
  await addAddressAction(formData);
}

async function deleteAddress(formData: FormData) {
  "use server";
  await deleteAddressAction(formData);
}

export default async function DashboardProfilePage() {
  const session = await requireAuth();
  const [profile, addresses, sessions] = await Promise.all([
    db.customerProfile.findUnique({ where: { userId: session.userId } }),
    db.address.findMany({ where: { userId: session.userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
    db.loginSession.findMany({ where: { userId: session.userId }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Client portal</p>
        <h1 className="mt-2 text-3xl font-serif font-semibold text-white">Account</h1>
        <p className="mt-2 text-luxury-muted">Profile, addresses, password policy, and active sessions.</p>
      </header>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Profile</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="firstName" required defaultValue={profile?.firstName ?? session.firstName} className="input-luxury w-full" placeholder="First name" />
              <input name="lastName" required defaultValue={profile?.lastName ?? session.lastName} className="input-luxury w-full" placeholder="Last name" />
            </div>
            <input name="phone" defaultValue={profile?.phone ?? ""} className="input-luxury w-full" placeholder="Phone" />
            <SubmitButton>Save profile</SubmitButton>
          </form>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Change password</h2>
          <form action={changePassword} className="space-y-4">
            <input name="currentPassword" required type="password" className="input-luxury w-full" placeholder="Current password" />
            <input name="newPassword" required type="password" minLength={12} className="input-luxury w-full" placeholder="New password" />
            <input name="confirmPassword" required type="password" minLength={12} className="input-luxury w-full" placeholder="Confirm new password" />
            <SubmitButton>Change password</SubmitButton>
          </form>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Addresses</h2>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="rounded-xl border border-luxury-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{address.label}{address.isDefault ? " / Default" : ""}</p>
                    <p className="mt-1 text-sm text-luxury-muted">{address.street}, {address.city} {address.postalCode}</p>
                    <p className="text-sm text-luxury-muted">{address.phone}</p>
                  </div>
                  <form action={deleteAddress}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <SubmitButton variant="ghost">Delete</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl">
          <h2 className="mb-4 text-xl font-serif text-white">Add address</h2>
          <form action={addAddress} className="space-y-3">
            <input name="label" className="input-luxury w-full" placeholder="Label" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="firstName" required className="input-luxury w-full" placeholder="First name" />
              <input name="lastName" required className="input-luxury w-full" placeholder="Last name" />
            </div>
            <input name="phone" required className="input-luxury w-full" placeholder="Phone" />
            <input name="street" required className="input-luxury w-full" placeholder="Street" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="city" required className="input-luxury w-full" placeholder="City" />
              <input name="postalCode" required className="input-luxury w-full" placeholder="Postal code" />
            </div>
            <input type="hidden" name="isDefault" value="false" />
            <SubmitButton>Add address</SubmitButton>
          </form>
        </Card>
      </section>

      <Card className="rounded-2xl">
        <h2 className="mb-4 text-xl font-serif text-white">Login sessions</h2>
        <div className="space-y-3">
          {sessions.map((item) => (
            <div key={item.id} className="rounded-xl border border-luxury-border p-4 text-sm text-luxury-muted">
              <p className="font-medium text-white">{item.userAgent ?? "Unknown device"}</p>
              <p>Created {item.createdAt.toLocaleString("fr-FR")} / expires {item.expiresAt.toLocaleString("fr-FR")}</p>
              <p>{item.revokedAt ? "Revoked" : "Active"}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
