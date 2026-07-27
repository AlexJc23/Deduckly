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

export default function ThirdPartyServicesNoticeScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const openEmail = () => {
    Linking.openURL('mailto:deducklysupport@karlsonworks.com');
  };

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.bullet}>• {children}</Text>
  );

  const Subheading = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.subHeader}>{children}</Text>
  );

  const Link = ({
    url,
    children,
  }: {
    url: string;
    children: React.ReactNode;
  }) => (
    <TouchableOpacity onPress={() => openLink(url)}>
      <Text style={styles.email}>{children}</Text>
    </TouchableOpacity>
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
        <Text style={styles.title}>Third-Party Services Notice</Text>
        <Text style={styles.subtitle}>Effective Date: August 1, 2026</Text>
        <Text style={styles.appName}>Deduckly by KarlsonWorks</Text>

        <Text style={styles.paragraph}>
          This Third-Party Services Notice explains the external service
          providers used by KarlsonWorks in connection with the Deduckly mobile
          application ("Deduckly" or the "App").
        </Text>

        <Text style={styles.paragraph}>
          Deduckly relies on trusted third-party providers to deliver certain
          features, improve reliability, maintain security, process
          subscriptions, and store user data.
        </Text>

        <Text style={styles.paragraph}>
          By using Deduckly, you acknowledge that information may be processed
          by these providers as necessary to provide their services.
        </Text>

        <Section number="1" title="DigitalOcean">
          <Text style={styles.paragraph}>
            Deduckly uses DigitalOcean cloud infrastructure for:
          </Text>

          <Bullet>Application hosting</Bullet>
          <Bullet>Database hosting</Bullet>
          <Bullet>Server operations</Bullet>
          <Bullet>Infrastructure management</Bullet>

          <Text style={styles.paragraph}>
            DigitalOcean may process technical information necessary to operate
            and secure the platform.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://www.digitalocean.com">
            https://www.digitalocean.com
          </Link>

          <Subheading>Privacy Policy</Subheading>
          <Link url="https://www.digitalocean.com/legal/privacy-policy">
            https://www.digitalocean.com/legal/privacy-policy
          </Link>
        </Section>

        <Section number="2" title="Amazon Web Services (AWS)">
          <Text style={styles.paragraph}>
            Deduckly uses Amazon Web Services, including Amazon S3, for:
          </Text>

          <Bullet>Receipt storage</Bullet>
          <Bullet>File uploads</Bullet>
          <Bullet>Expense documentation storage</Bullet>
          <Bullet>Backup and file management</Bullet>

          <Text style={styles.paragraph}>
            Uploaded receipts, images, and supporting documentation may be
            securely stored using AWS cloud services.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://aws.amazon.com">
            https://aws.amazon.com
          </Link>

          <Subheading>Privacy Policy</Subheading>
          <Link url="https://aws.amazon.com/privacy/">
            https://aws.amazon.com/privacy/
          </Link>
        </Section>

        <Section number="3" title="Google Sign-In">
          <Text style={styles.paragraph}>
            Deduckly may offer authentication through Google Sign-In.
          </Text>

          <Text style={styles.paragraph}>
            If you choose to sign in using Google, Deduckly may receive:
          </Text>

          <Bullet>Name</Bullet>
          <Bullet>Email address</Bullet>
          <Bullet>Google account identifier</Bullet>

          <Text style={styles.paragraph}>
            This information is used solely for authentication and account
            management.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://www.google.com">
            https://www.google.com
          </Link>

          <Subheading>Privacy Policy</Subheading>
          <Link url="https://policies.google.com/privacy">
            https://policies.google.com/privacy
          </Link>
        </Section>

        <Section number="4" title="Sign in with Apple">
          <Text style={styles.paragraph}>
            Deduckly may offer authentication through Sign in with Apple.
          </Text>

          <Text style={styles.paragraph}>
            Depending on your Apple account settings, Apple may provide:
          </Text>

          <Bullet>Email address</Bullet>
          <Bullet>Private relay email address</Bullet>
          <Bullet>Unique Apple account identifier</Bullet>

          <Text style={styles.paragraph}>
            This information is used solely for authentication and account
            management.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://www.apple.com">
            https://www.apple.com
          </Link>

          <Subheading>Privacy Policy</Subheading>
          <Link url="https://www.apple.com/legal/privacy/">
            https://www.apple.com/legal/privacy/
          </Link>
        </Section>

        <Section number="5" title="Apple In-App Purchases">
          <Text style={styles.paragraph}>
            Premium subscriptions and purchases are processed through Apple's
            App Store billing system.
          </Text>

          <Text style={styles.paragraph}>
            Apple is responsible for:
          </Text>

          <Bullet>Payment processing</Bullet>
          <Bullet>Subscription billing</Bullet>
          <Bullet>Subscription renewals</Bullet>
          <Bullet>Refund processing</Bullet>
          <Bullet>Payment security</Bullet>

          <Text style={styles.paragraph}>
            KarlsonWorks does not directly collect or store payment card
            information.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://www.apple.com">
            https://www.apple.com
          </Link>

          <Subheading>Terms</Subheading>
          <Link url="https://www.apple.com/legal/internet-services/itunes/">
            https://www.apple.com/legal/internet-services/itunes/
          </Link>
        </Section>

        <Section number="6" title="RevenueCat">
          <Text style={styles.paragraph}>
            Deduckly may use RevenueCat to manage subscriptions, purchases,
            entitlements, and premium feature access.
          </Text>

          <Text style={styles.paragraph}>
            RevenueCat may process:
          </Text>

          <Bullet>Subscription status</Bullet>
          <Bullet>Purchase information</Bullet>
          <Bullet>Device identifiers</Bullet>
          <Bullet>App user identifiers</Bullet>

          <Text style={styles.paragraph}>
            RevenueCat does not process payment cards directly.
          </Text>

          <Subheading>Website</Subheading>
          <Link url="https://www.revenuecat.com">
            https://www.revenuecat.com
          </Link>

          <Subheading>Privacy Policy</Subheading>
          <Link url="https://www.revenuecat.com/privacy">
            https://www.revenuecat.com/privacy
          </Link>
        </Section>

        <Section number="7" title="Advertising Providers">
          <Text style={styles.paragraph}>
            Deduckly may display advertisements through third-party advertising
            providers.
          </Text>

          <Text style={styles.paragraph}>
            Advertising providers may process:
          </Text>

          <Bullet>Device identifiers</Bullet>
          <Bullet>Advertising identifiers</Bullet>
          <Bullet>Usage information</Bullet>
          <Bullet>General location information</Bullet>

          <Text style={styles.paragraph}>
            This information may be used to display relevant advertisements and
            measure advertising performance.
          </Text>

          <Text style={styles.paragraph}>
            Specific advertising providers may change over time.
          </Text>
        </Section>

        <Section number="8" title="Error Monitoring & Crash Reporting">
          <Text style={styles.paragraph}>
            Deduckly may use third-party monitoring providers such as Sentry or
            similar services to:
          </Text>

          <Bullet>Detect crashes</Bullet>
          <Bullet>Diagnose technical issues</Bullet>
          <Bullet>Improve app reliability</Bullet>
          <Bullet>Monitor performance</Bullet>

          <Text style={styles.paragraph}>
            Collected information may include technical diagnostics, device
            information, and application error logs.
          </Text>
        </Section>

        <Section number="9" title="Email & Communication Services">
          <Text style={styles.paragraph}>
            Deduckly may use third-party email delivery providers to send:
          </Text>

          <Bullet>Account verification emails</Bullet>
          <Bullet>Password reset emails</Bullet>
          <Bullet>Service notifications</Bullet>
          <Bullet>Support communications</Bullet>

          <Text style={styles.paragraph}>
            These providers may process email addresses and related
            communication metadata.
          </Text>
        </Section>

        <Section number="10" title="Future Service Providers">
          <Text style={styles.paragraph}>
            As Deduckly evolves, additional providers may be added for:
          </Text>

          <Bullet>Analytics</Bullet>
          <Bullet>Customer support</Bullet>
          <Bullet>Advertising</Bullet>
          <Bullet>Performance monitoring</Bullet>
          <Bullet>Data storage</Bullet>
          <Bullet>Communication services</Bullet>
          <Bullet>Security services</Bullet>

          <Text style={styles.paragraph}>
            This notice may be updated periodically to reflect changes in
            service providers.
          </Text>
        </Section>

        <Section number="11" title="Questions">
          <Text style={styles.paragraph}>
            If you have questions regarding third-party services used by
            Deduckly, contact:
          </Text>

          <Text style={styles.paragraph}>KarlsonWorks</Text>


          <TouchableOpacity onPress={openEmail}>
            <Text style={styles.email}>deducklysupport@karlsonworks.com</Text>
          </TouchableOpacity>
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