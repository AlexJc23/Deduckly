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

export default function AccountDataDeletionPolicyScreen() {
  const openEmail = () => {
    Linking.openURL('mailto:deducklysupport@karlsonworks.com');
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
        <Text style={styles.title}>Account &amp; Data Deletion Policy</Text>
        <Text style={styles.subtitle}>Last Updated: August 1, 2026</Text>
        <Text style={styles.appName}>Deduckly by KarlsonWorks</Text>

        <Text style={styles.paragraph}>
          At KarlsonWorks, we respect your right to control your personal
          information. This Account &amp; Data Deletion Policy explains how
          Deduckly users can delete their accounts and personal data.
        </Text>

        <Section number="1" title="Deleting Your Account">
          <Text style={styles.paragraph}>
            Users may permanently delete their Deduckly account directly within
            the app.
          </Text>

          <Subheading>To delete your account:</Subheading>

          <Bullet>Open Deduckly.</Bullet>
          <Bullet>Navigate to User Settings or Privacy.</Bullet>
          <Bullet>Tap Delete Account.</Bullet>
          <Bullet>Confirm your deletion request.</Bullet>

          <Text style={styles.paragraph}>
            Once confirmed, the deletion process will begin.
          </Text>
        </Section>

        <Section number="2" title="What Happens When You Delete Your Account">
          <Text style={styles.paragraph}>
            Deleting your account will result in the removal of:
          </Text>

          <Bullet>Account information</Bullet>
          <Bullet>Profile information</Bullet>
          <Bullet>Trip records</Bullet>
          <Bullet>Mileage records</Bullet>
          <Bullet>Expense records</Bullet>
          <Bullet>Uploaded receipts and documents</Bullet>
          <Bullet>User-generated content associated with your account</Bullet>

          <Text style={styles.paragraph}>
            You will lose access to your account and any associated data.
          </Text>

          <Text style={styles.paragraph}>
            This action cannot be undone.
          </Text>
        </Section>

        <Section number="3" title="Data Retention Exceptions">
          <Text style={styles.paragraph}>
            Certain information may be retained for a limited period when
            required to:
          </Text>

          <Bullet>Comply with legal obligations</Bullet>
          <Bullet>Resolve disputes</Bullet>
          <Bullet>Enforce agreements</Bullet>
          <Bullet>
            Detect or prevent fraud, abuse, or security incidents
          </Bullet>

          <Text style={styles.paragraph}>
            Any retained information will be stored only for as long as
            necessary to satisfy these requirements.
          </Text>
        </Section>

        <Section number="4" title="Subscription Information">
          <Text style={styles.paragraph}>
            Subscription purchases are managed through Apple App Store services.
          </Text>

          <Text style={styles.paragraph}>
            Deleting your Deduckly account does not automatically cancel an
            active subscription.
          </Text>

          <Text style={styles.paragraph}>
            Users must manage or cancel subscriptions through their Apple ID
            subscription settings.
          </Text>
        </Section>

        <Section number="5" title="Processing Time">
          <Text style={styles.paragraph}>
            Most account deletion requests are processed automatically.
          </Text>

          <Text style={styles.paragraph}>
            In some cases, complete removal of backups or stored records may
            require additional time.
          </Text>
        </Section>

        <Section number="6" title="Contact Us">
          <Text style={styles.paragraph}>
            If you experience issues deleting your account or have questions
            regarding data deletion, contact:
          </Text>

          <TouchableOpacity onPress={openEmail}>
            <Text style={styles.email}>deducklysupport@karlsonworks.com</Text>
          </TouchableOpacity>

          <Text style={styles.paragraph}>KarlsonWorks</Text>
          <Text style={styles.paragraph}>United States</Text>
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