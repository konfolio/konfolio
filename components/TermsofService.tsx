export default function TermsOfService() {
  return (
    <div className="max-w-[720px] mx-auto px-6 pt-12 pb-20 bg-[#F7F7F7]">
      <h1 className="text-[22px] font-medium text-[#262626] mb-2">
        Konfolio – Terms of Service
      </h1>
      <p className="text-sm text-[#A5A5A5] mb-10">
        Effective date: January 21, 2026
      </p>
      <p className="text-base leading-[1.7] text-[#262626] mb-12">
        Konfolio is a web-based platform that streamlines the application and
        portfolio review process between small art businesses (including artists
        and vendors) and event organizers such as conventions and fairs. By
        accessing or using the Konfolio website, applications, or services, you
        agree to be bound by the following Terms of Service. If you do not agree
        to our terms, do not use our services.
      </p>

      {sections.map((section) => (
        <div key={section.title} className="mb-12">
          <h2 className="text-base font-medium text-[#262626] mb-3">
            {section.title}
          </h2>
          {section.body}
        </div>
      ))}
      <p className="text-base leading-[1.7] text-[#262626] mt-4">
        By using Konfolio, you acknowledge that you have read, understood, and
        agree to be bound by these Terms of Service.
      </p>
    </div>
  );
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-base leading-[1.7] text-[#262626] mb-3">{children}</p>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <p className="text-base leading-[1.7] text-[#262626] italic mb-1">
    {children}
  </p>
);

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
);

const LI = ({ children }: { children: React.ReactNode }) => (
  <li className="text-base leading-[1.7] text-[#262626]">{children}</li>
);

const sections = [
  {
    title: "Eligibility and account registration",
    body: (
      <>
        <P>
          You must be at least 18 years old (or the age of legal majority in
          your jurisdiction) to use the Services. To access certain features,
          you must create an account and provide accurate, complete, and current
          information. You are responsible for maintaining the confidentiality
          of your account credentials and for all activities that occur under
          your account.
        </P>
        <P>
          You agree not to share your account or access credentials with others
          and to notify us promptly of any unauthorized use or security breach.
        </P>
      </>
    ),
  },
  {
    title: "Use of our services",
    body: (
      <>
        <Em>Permitted use –</Em>
        <P>
          Konfolio grants you a limited, non-exclusive, non-transferable, and
          revocable license to access and use our services for lawful purposes
          related to:
        </P>
        <UL>
          <LI>Submitting applications and portfolios</LI>
          <LI>Reviewing, organizing, and managing submissions</LI>
          <LI>Communicating with other users through platform features</LI>
        </UL>
        <Em>Prohibited use –</Em>
        <P>You agree not to:</P>
        <UL>
          <LI>
            Use the Services for any unlawful, harmful, or fraudulent purpose
          </LI>
          <LI>
            Upload content that infringes intellectual property rights or
            violates applicable laws
          </LI>
          <LI>
            Circumvent, disable, or interfere with security-related features
          </LI>
          <LI>
            Reverse engineer, copy, or resell the Services except as expressly
            permitted
          </LI>
          <LI>
            Scrape, harvest, or collect data from the Services without
            authorization
          </LI>
        </UL>
      </>
    ),
  },
  {
    title: "User content",
    body: (
      <>
        <Em>Ownership –</Em>
        <P>
          You retain ownership of all content you submit, upload, or otherwise
          make available through our services, including artwork, portfolios,
          images, text, and other materials (&quot;User Content&quot;).
        </P>
        <Em>License to Konfolio –</Em>
        <P>
          By submitting User Content, you grant Konfolio a worldwide,
          non-exclusive, royalty-free license to host, store, reproduce,
          display, and distribute your User Content solely for the purpose of
          operating, improving, and providing our services.
        </P>
        <Em>Responsibility for content –</Em>
        <P>
          You are solely responsible for your User Content and represent that
          you have all necessary rights to grant the above license. Konfolio
          does not endorse any User Content and reserves the right to remove or
          restrict access to content that violates these Terms or applicable
          law.
        </P>
      </>
    ),
  },
  {
    title: "Intellectual property",
    body: (
      <P>
        Our services, including software, design, text, graphics, logos, and
        other materials (excluding User Content), are owned by or licensed to
        Konfolio and are protected by intellectual property laws. These Terms of
        Service do not grant you any ownership rights in the services or
        Konfolio&apos;s intellectual property.
      </P>
    ),
  },
  {
    title: "Fees and payments",
    body: (
      <P>
        Some features of our services may be offered for a fee. Any applicable
        fees, billing terms, and payment obligations will be disclosed at the
        time you select or purchase such features. Unless otherwise stated, fees
        are non-refundable to the maximum extent permitted by law.
      </P>
    ),
  },
  {
    title: "Third-party services",
    body: (
      <P>
        Our services may integrate with or link to third-party platforms, tools,
        or services. Konfolio is not responsible for third-party content,
        services, or practices, and your use of third-party services is subject
        to their respective terms and policies.
      </P>
    ),
  },
  {
    title: "Termination",
    body: (
      <P>
        You may stop using our services at any time. Konfolio reserves the right
        to suspend or terminate your access to our services at any time, with or
        without notice, if we reasonably believe you have violated these Terms
        or pose a risk to the platform or other users. Upon termination, your
        right to use our services will cease, but provisions that by their
        nature should survive termination will remain in effect.
      </P>
    ),
  },
  {
    title: "Disclaimers",
    body: (
      <P>
        The Services are provided on an &quot;AS IS&quot; and &quot;AS
        AVAILABLE&quot; basis. To the fullest extent permitted by law, Konfolio
        disclaims all warranties, express or implied, including warranties of
        merchantability, fitness for a particular purpose, and non-infringement.
        We do not guarantee that the Services will be uninterrupted, secure, or
        error-free.
      </P>
    ),
  },
  {
    title: "Limitation of liability",
    body: (
      <P>
        To the maximum extent permitted by law, Konfolio shall not be liable for
        any indirect, incidental, special, consequential, or punitive damages,
        or for any loss of profits, data, or goodwill, arising out of or related
        to your use of or inability to use our services.
      </P>
    ),
  },
  {
    title: "Indemnification",
    body: (
      <P>
        You agree to indemnify and hold harmless Konfolio and its affiliates,
        officers, directors, employees, and agents from and against any claims,
        liabilities, damages, losses, and expenses arising out of your use of
        our services or your violation of these Terms of Service.
      </P>
    ),
  },
  {
    title: "Changes to terms",
    body: (
      <P>
        We reserve the right to modify these Terms of Service at any time. We
        will notify you of material changes by updating the effective date or by
        other means. Your continued use of the Services after any changes
        constitutes your acceptance of the revised terms.
      </P>
    ),
  },
  {
    title: "Governing law",
    body: (
      <P>
        These Terms of Service are governed by and construed in accordance with
        the laws of the jurisdiction in which Konfolio is established, without
        regard to conflict of law principles.
      </P>
    ),
  },
  {
    title: "Contact information",
    body: (
      <>
        <P>
          If you have questions about these terms or our services, please
          contact us at:
        </P>
        <P>
          Konfolio
          <br />
          <a
            href="mailto:konfolios@gmail.com"
            className="text-[#262626] underline"
          >
            konfolios@gmail.com
          </a>
        </P>
      </>
    ),
  },
];
