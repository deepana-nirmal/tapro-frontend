import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaproLogo from '../components/branding/TaproLogo';

type LegalSection = { title: string; body: string };

const privacySections: LegalSection[] = [
  { title: 'Introduction', body: 'This Privacy Policy explains how Tapro handles information for restaurant accounts, staff users, and customer orders within the QR ordering platform.' },
  { title: 'Information collected', body: 'Tapro may process account details, restaurant profile information, menu data, table identifiers, order details, and technical session information required to operate the service.' },
  { title: 'Restaurant-account information', body: 'Restaurant owners and staff may provide names, email addresses, role assignments, restaurant names, descriptions, logos, and operational settings.' },
  { title: 'Customer-order information', body: 'Customer ordering flows may include selected menu items, quantities, table number, order status, order time, and totals needed for restaurant fulfillment.' },
  { title: 'How information is used', body: 'Information is used to authenticate users, route orders, manage menus, support restaurant operations, display order tracking, and maintain platform security.' },
  { title: 'Data sharing', body: 'Tapro should only share information with the restaurant account, authorized staff, service providers required to operate the platform, or where legally required.' },
  { title: 'Data security', body: 'Tapro uses application access controls and protected routes. Final security representations must be reviewed against deployed infrastructure and operational practices.' },
  { title: 'Data retention', body: 'Order and account data should be retained only as long as required for restaurant operations, legal obligations, and platform administration.' },
  { title: 'Cookies or local storage', body: 'The frontend may use browser storage for session and ordering context such as active table or last order details.' },
  { title: 'User rights', body: 'Users may request access, correction, or deletion where applicable. Final rights language depends on the jurisdictions where Tapro operates.' },
  { title: 'Children’s privacy', body: 'Tapro is intended for restaurant operations and ordering workflows, not for collecting information from children.' },
  { title: 'Policy updates', body: 'This policy may be updated as the platform evolves. Restaurants and users should review the current version periodically.' },
  { title: 'Contact information', body: 'Use the official Tapro contact channel provided by the platform operator for privacy requests.' },
];

const termsSections: LegalSection[] = [
  { title: 'Acceptance of terms', body: 'By using Tapro, restaurant users and customers agree to use the platform according to these terms and applicable laws.' },
  { title: 'Platform description', body: 'Tapro provides QR ordering, digital menu management, order workflows, staff-role access, restaurant administration, and reporting interfaces.' },
  { title: 'Restaurant responsibilities', body: 'Restaurants are responsible for accurate menus, prices, availability, staff access, order fulfillment, and customer-facing information.' },
  { title: 'Customer-order responsibilities', body: 'Customers are responsible for reviewing selected items, quantities, table details, and submitted order information before placing an order.' },
  { title: 'Account security', body: 'Users must protect account credentials and notify the platform operator if they believe access has been compromised.' },
  { title: 'Acceptable use', body: 'Users may not misuse Tapro, interfere with service operation, attempt unauthorized access, or upload unlawful or harmful content.' },
  { title: 'Subscription and payment terms', body: 'Subscription and payment terms apply only where a restaurant has entered into a billing arrangement. This landing page does not activate billing.' },
  { title: 'Availability and service changes', body: 'Tapro may change features, availability, or service behavior as the platform is maintained and improved.' },
  { title: 'Intellectual property', body: 'Tapro branding, interface design, and platform materials belong to their respective owners. Restaurant-provided content remains subject to restaurant rights and responsibilities.' },
  { title: 'Data and privacy', body: 'Use of Tapro is also governed by the Privacy Policy and operational data handling practices.' },
  { title: 'Limitation language', body: 'Final limitation of liability and warranty language requires legal review before production publication.' },
  { title: 'Account suspension and termination', body: 'Accounts may be suspended or terminated for misuse, security risks, non-payment where applicable, or violation of agreed terms.' },
  { title: 'Changes to terms', body: 'Terms may be updated as Tapro evolves. Continued use after updates may indicate acceptance of the revised terms.' },
  { title: 'Contact information', body: 'Use the official Tapro contact channel provided by the platform operator for terms-related questions.' },
];

const LegalLayout = ({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) => {
  useEffect(() => {
    document.title = `${title} | Tapro`;
  }, [title]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Back to Tapro home"><TaproLogo size="sm" className="max-w-[150px]" /></Link>
          <Link to="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back to home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Source note: final legal review is required before production publication.
        </div>
        <h1 className="mt-8 text-[clamp(2rem,7vw,3.5rem)] font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{intro}</p>
        <div className="mt-10 grid gap-4">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

// Final legal review is required before publishing this policy as binding legal text.
export const PrivacyPolicyPage = () => (
  <LegalLayout
    title="Privacy Policy"
    intro="This policy describes Tapro data handling at a product level. It should be reviewed by qualified counsel before production use."
    sections={privacySections}
  />
);

// Final legal review is required before publishing these terms as binding legal text.
export const TermsPage = () => (
  <LegalLayout
    title="Terms and Conditions"
    intro="These terms describe expected platform responsibilities and acceptable use at a product level. They should be reviewed by qualified counsel before production use."
    sections={termsSections}
  />
);
