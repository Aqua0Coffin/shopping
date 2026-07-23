import { getSiteSettings } from "@/lib/site-settings";
import SiteSettingsClient from "@/components/admin/SiteSettingsClient";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <SiteSettingsClient
      initial={{
        hero_supertitle: settings.hero_supertitle,
        hero_headline: settings.hero_headline,
        hero_subheadline: settings.hero_subheadline,
        hero_cta_primary: settings.hero_cta_primary,
        hero_cta_secondary: settings.hero_cta_secondary,
        shipping_flat_paise: settings.shipping_flat_paise,
        tax_rate_bps: settings.tax_rate_bps,
      }}
    />
  );
}
