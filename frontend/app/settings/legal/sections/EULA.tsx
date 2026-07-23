import React from 'react';
import {
  Linking,
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { BackHeader } from '@/components/ui/BackButton';

export default function EndUserLicenseAgreementScreen() {
  const openEmail = () => {
    Linking.openURL('mailto:support@karlsonworks.com');
  };

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.bullet}>• {children}</Text>
  );

  const Subheading = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.subHeader}>{children}</Text>
  );

  const Section = ({
    number,
    title,
    children,
  }: {
    number: string;
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {number}. {title}
      </Text>

      {children}
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <BackHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>End User License Agreement</Text>
        <Text style={styles.subtitle}>Effective Date: August 1, 2026</Text>
        <Text style={styles.appName}>Deduckly by KarlsonWorks</Text>

        <Text style={styles.paragraph}>
          This End User License Agreement ("EULA") is a legal agreement between
          you ("User," "you," or "your") and KarlsonWorks ("KarlsonWorks," "we,"
          "our," or "us") governing your use of the Deduckly mobile application
          ("Deduckly" or the "App").
        </Text>

        <Text style={styles.paragraph}>
          By downloading, installing, accessing, or using Deduckly, you agree to
          be bound by this EULA.
        </Text>

        <Text style={styles.paragraph}>
          If you do not agree to these terms, do not use the App.
        </Text>

        <Section number="1" title="License Grant">
          <Text style={styles.paragraph}>
            KarlsonWorks grants you a limited, non-exclusive,
            non-transferable, revocable license to:
          </Text>

          <Bullet>
            Download and use Deduckly on Apple devices that you own or control
          </Bullet>
          <Bullet>Use Deduckly for personal or business purposes</Bullet>
          <Bullet>
            Access features made available through your account and subscription
            level
          </Bullet>

          <Text style={styles.paragraph}>
            This license is granted solely for use in accordance with this
            EULA.
          </Text>
        </Section>

        <Section number="2" title="Ownership">
          <Text style={styles.paragraph}>
            Deduckly, including all software, code, designs, trademarks,
            graphics, content, and intellectual property rights, remains the
            exclusive property of KarlsonWorks.
          </Text>

          <Text style={styles.paragraph}>
            This EULA grants a license to use the App and does not transfer
            ownership of any intellectual property.
          </Text>
        </Section>

        <Section number="3" title="Permitted Use">
          <Text style={styles.paragraph}>
            You may use Deduckly to:
          </Text>

          <Bullet>Track mileage</Bullet>
          <Bullet>Record trips</Bullet>
          <Bullet>Store expenses and receipts</Bullet>
          <Bullet>Generate reports</Bullet>
          <Bullet>Access subscription features</Bullet>
          <Bullet>Manage business-related driving records</Bullet>
        </Section>

        <Section number="4" title="Prohibited Activities">
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>

          <Bullet>
            Reverse engineer, decompile, or disassemble the App
          </Bullet>
          <Bullet>
            Modify or create derivative works of the App
          </Bullet>
          <Bullet>Circumvent security measures</Bullet>
          <Bullet>Access systems without authorization</Bullet>
          <Bullet>Use the App for unlawful activities</Bullet>
          <Bullet>Upload malicious software or harmful content</Bullet>
          <Bullet>Attempt to interfere with App functionality</Bullet>
          <Bullet>
            Scrape, automate, or abuse services beyond intended use
          </Bullet>
          <Bullet>
            Use the App to commit fraud or provide false financial information
          </Bullet>

          <Text style={styles.paragraph}>
            Because every Terms document eventually needs a section politely
            explaining that cybercrime is not a supported feature.
          </Text>
        </Section>

        <Section number="5" title="User Content">
          <Text style={styles.paragraph}>
            Users may upload and create content including:
          </Text>

          <Bullet>Trips</Bullet>
          <Bullet>Mileage records</Bullet>
          <Bullet>Receipts</Bullet>
          <Bullet>Expense records</Bullet>
          <Bullet>Notes</Bullet>
          <Bullet>Supporting documentation</Bullet>

          <Text style={styles.paragraph}>
            You retain ownership of your content.
          </Text>

          <Text style={styles.paragraph}>
            By uploading content, you grant KarlsonWorks a limited license to:
          </Text>

          <Bullet>Store content</Bullet>
          <Bullet>Process content</Bullet>
          <Bullet>Display content within the App</Bullet>
          <Bullet>Generate reports using that content</Bullet>

          <Text style={styles.paragraph}>
            solely for operating and improving Deduckly services.
          </Text>
        </Section>

        <Section number="6" title="Subscription Services">
          <Text style={styles.paragraph}>
            Certain features may require a paid subscription.
          </Text>

          <Text style={styles.paragraph}>
            Subscriptions are processed through Apple In-App Purchases.
          </Text>

          <Subheading>
            Subscription features may include:
          </Subheading>

          <Bullet>Unlimited trip tracking</Bullet>
          <Bullet>Advanced reporting</Bullet>
          <Bullet>Receipt storage</Bullet>
          <Bullet>Tax-ready exports</Bullet>
          <Bullet>Additional premium features</Bullet>

          <Text style={styles.paragraph}>
            Subscription pricing may change in the future.
          </Text>

          <Text style={styles.paragraph}>
            Current pricing will always be displayed before purchase.
          </Text>
        </Section>
                <Section number="7" title="Billing & Renewals">
          <Text style={styles.paragraph}>
            Subscriptions automatically renew unless canceled through your Apple
            ID account settings.
          </Text>

          <Text style={styles.paragraph}>
            Billing, cancellations, and refunds are managed by Apple.
          </Text>

          <Text style={styles.paragraph}>
            KarlsonWorks does not:
          </Text>

          <Bullet>Process payment cards</Bullet>
          <Bullet>Store payment card information</Bullet>
          <Bullet>Directly issue App Store refunds</Bullet>

          <Text style={styles.paragraph}>
            Refund requests must be submitted through Apple.
          </Text>
        </Section>

        <Section number="8" title="Third-Party Services">
          <Text style={styles.paragraph}>
            Deduckly relies on third-party providers to operate certain
            features.
          </Text>

          <Text style={styles.paragraph}>
            These providers may include:
          </Text>

          <Bullet>Google Sign-In</Bullet>
          <Bullet>Sign in with Apple</Bullet>
          <Bullet>Apple In-App Purchases</Bullet>
          <Bullet>Amazon Web Services (AWS)</Bullet>
          <Bullet>DigitalOcean</Bullet>

          <Text style={styles.paragraph}>
            Use of these services may also be subject to their own terms and
            privacy policies.
          </Text>
        </Section>

        <Section number="9" title="Availability">
          <Text style={styles.paragraph}>
            We strive to provide reliable service but do not guarantee:
          </Text>

          <Bullet>Continuous availability</Bullet>
          <Bullet>Uninterrupted access</Bullet>
          <Bullet>Error-free operation</Bullet>

          <Text style={styles.paragraph}>
            The App may occasionally be unavailable due to:
          </Text>

          <Bullet>Maintenance</Bullet>
          <Bullet>Updates</Bullet>
          <Bullet>Infrastructure issues</Bullet>
          <Bullet>Events outside our control</Bullet>

          <Text style={styles.paragraph}>
            The servers are computers. Computers occasionally express
            themselves through chaos.
          </Text>
        </Section>

        <Section number="10" title="Account Suspension & Termination">
          <Text style={styles.paragraph}>
            KarlsonWorks may suspend or terminate accounts that:
          </Text>

          <Bullet>Violate this EULA</Bullet>
          <Bullet>Violate applicable laws</Bullet>
          <Bullet>Abuse services</Bullet>
          <Bullet>Engage in fraudulent activity</Bullet>
          <Bullet>Attempt unauthorized access</Bullet>

          <Text style={styles.paragraph}>
            Users may stop using the App and request account deletion at any
            time.
          </Text>
        </Section>

        <Section number="11" title="Disclaimer of Warranties">
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, DEDUCKLY IS PROVIDED "AS IS"
            AND "AS AVAILABLE."
          </Text>

          <Text style={styles.paragraph}>
            KARLSONWORKS DISCLAIMS ALL WARRANTIES, INCLUDING:
          </Text>

          <Bullet>MERCHANTABILITY</Bullet>
          <Bullet>FITNESS FOR A PARTICULAR PURPOSE</Bullet>
          <Bullet>NON-INFRINGEMENT</Bullet>
          <Bullet>ACCURACY OF RESULTS</Bullet>
          <Bullet>AVAILABILITY OF SERVICES</Bullet>

          <Text style={styles.paragraph}>
            Deduckly provides tools and reports but does not provide:
          </Text>

          <Bullet>Tax advice</Bullet>
          <Bullet>Accounting advice</Bullet>
          <Bullet>Legal advice</Bullet>
          <Bullet>Financial advice</Bullet>

          <Text style={styles.paragraph}>
            Always consult qualified professionals when necessary.
          </Text>
        </Section>

        <Section number="12" title="Limitation of Liability">
          <Text style={styles.paragraph}>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, KARLSONWORKS SHALL NOT BE
            LIABLE FOR:
          </Text>

          <Bullet>Indirect damages</Bullet>
          <Bullet>Consequential damages</Bullet>
          <Bullet>Lost profits</Bullet>
          <Bullet>Lost business opportunities</Bullet>
          <Bullet>Lost tax deductions</Bullet>
          <Bullet>Data loss</Bullet>
          <Bullet>Service interruptions</Bullet>

          <Text style={styles.paragraph}>
            In no event shall KarlsonWorks' total liability exceed the amount
            paid by you to KarlsonWorks during the previous twelve (12) months.
          </Text>
        </Section>

        <Section number="13" title="Indemnification">
          <Text style={styles.paragraph}>
            You agree to defend, indemnify, and hold harmless KarlsonWorks from
            claims, damages, losses, liabilities, and expenses arising from:
          </Text>

          <Bullet>Your use of the App</Bullet>
          <Bullet>Your content</Bullet>
          <Bullet>Violation of this EULA</Bullet>
          <Bullet>Violation of applicable laws</Bullet>
        </Section>
                <Section number="14" title="Privacy">
          <Text style={styles.paragraph}>
            Your use of Deduckly is also governed by our Privacy Policy.
          </Text>

          <Text style={styles.paragraph}>
            The Privacy Policy explains how personal information is collected,
            used, stored, and protected.
          </Text>
        </Section>

        <Section number="15" title="Changes to This Agreement">
          <Text style={styles.paragraph}>
            We may update this EULA periodically.
          </Text>

          <Text style={styles.paragraph}>
            Updated versions become effective upon publication within the App or
            associated websites.
          </Text>

          <Text style={styles.paragraph}>
            Continued use of Deduckly after updates constitutes acceptance of
            the revised agreement.
          </Text>
        </Section>

        <Section number="16" title="Governing Law">
          <Text style={styles.paragraph}>
            This EULA shall be governed by and construed under the laws of the
            State of Georgia, United States, without regard to conflict of law
            principles.
          </Text>
        </Section>

        <Section number="17" title="Contact Information">
          <Text style={styles.paragraph}>KarlsonWorks</Text>

          <Text style={styles.paragraph}>Support Email:</Text>

          <TouchableOpacity onPress={openEmail}>
            <Text style={styles.email}>deducklysupport@karlsonworks.com</Text>
          </TouchableOpacity>
        </Section>

        <Section number="18" title="Apple-Specific Notice">
          <Text style={styles.paragraph}>
            If Deduckly is obtained through the Apple App Store:
          </Text>

          <Bullet>
            Apple is not responsible for maintenance or support of the App.
          </Bullet>
          <Bullet>
            Apple is not responsible for addressing claims relating to the App.
          </Bullet>
          <Bullet>
            Apple and its subsidiaries are third-party beneficiaries of this
            EULA and may enforce its terms.
          </Bullet>

          <Text style={styles.paragraph}>
            All rights not expressly granted under this EULA are reserved by
            KarlsonWorks.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6E6E73',
    marginBottom: 6,
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2DBE60',
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2DBE60',
    marginBottom: 14,
    flex: 1,
  },
  email: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2DBE60',
    marginTop: 6,
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 10,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 27,
    color: '#4B5563',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 27,
    color: '#4B5563',
    marginBottom: 6,
  },
});