import { readContent } from "@sew-lovely/cms";
import { BackArrow } from "../components/back-arrow";
import { ProfileForm } from "../components/profile-form";
import { FloatingWhatsApp } from "../components/store-actions";
import { SiteNav } from "../components/site-nav";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { site } = await readContent();

  return (
    <>
      <SiteNav navigation={site.navigation} />
      <BackArrow />
      <main className="wrap profile-page">
        <section className="profile-copy">
          <p className="eyebrow">Sew Lovely profile</p>
          <h1>Manage your details</h1>
          <p>Save your contact details for offers, arrivals and follow-ups from the shop.</p>
        </section>
        <section className="profile-card" aria-label="Profile form">
          <ProfileForm />
        </section>
      </main>
      <FloatingWhatsApp />
      <footer>
        <div className="wrap footer-bottom">
          <span>© 2026 Sew Lovely. All Rights Reserved.</span>
          <span>{site.email}</span>
        </div>
      </footer>
    </>
  );
}
