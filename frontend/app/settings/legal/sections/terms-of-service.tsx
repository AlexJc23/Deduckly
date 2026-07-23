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

export default function TermsOfServiceScreen() {


  const openEmail = () => {
      Linking.openURL("mailto:support@karlsonworks.com");
  };

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <Text style={styles.bullet}>
        • {children}
    </Text>
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

          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.subtitle}>Last Updated: August 1, 2026</Text>
          <Text style={styles.appName}>
              Deduckly by KarlsonWorks
          </Text>

          <Text style={styles.paragraph}>
            Welcome to Deduckly, operated by KarlsonWorks ("Company," "we,"
            "our," or "us"). These Terms of Service ("Terms") govern your access
            to and use of the Deduckly mobile application, website, and related
            services (collectively, the "Service").
          </Text>

          <Text style={styles.paragraph}>
            By creating an account or using Deduckly, you agree to be bound by
            these Terms. If you do not agree, do not use the Service.
          </Text>

          <Section number="1" title="Eligibility">
            <Text style={styles.paragraph}>
              You must be at least 16 years old to use Deduckly.
            </Text>

            <Subheading>By using the Service, you represent and warrant that:</Subheading>

            <Bullet>You are at least 16 years old.</Bullet>
            <Bullet>
              You have the legal capacity to enter into these Terms.
            </Bullet>
            <Bullet>
              The information you provide is accurate and current.
            </Bullet>
          </Section>

          <Section number="2" title="Description of Service">
            <Text style={styles.paragraph}>
              Deduckly provides tools that may assist users with:
            </Text>

            <Bullet>Mileage tracking</Bullet>
            <Bullet>Trip tracking</Bullet>
            <Bullet>Expense tracking</Bullet>
            <Bullet>Receipt storage</Bullet>
            <Bullet>Reporting and record keeping</Bullet>
            <Bullet>
              Other productivity features related to gig work, freelancing, and
              business activities
            </Bullet>

            <Text style={styles.paragraph}>
              Deduckly is provided for informational and organizational purposes
              only.
            </Text>
          </Section>

          <Section number="3" title="User Accounts">
            <Subheading>You are responsible for:</Subheading>

            <Bullet>Maintaining the security of your account</Bullet>
            <Bullet>Protecting your login credentials</Bullet>
            <Bullet>All activity occurring under your account</Bullet>

            <Text style={styles.paragraph}>
              You agree to notify us immediately of any unauthorized access or
              security breach.
            </Text>

            <Text style={styles.paragraph}>
              We reserve the right to suspend or terminate accounts that violate
              these Terms.
            </Text>
          </Section>

          <Section number="4" title="Subscriptions and Payments">
            <Text style={styles.paragraph}>
              Certain features may require a paid subscription.
            </Text>

            <Text style={styles.paragraph}>
              Subscriptions purchased through Apple are managed by Apple through
              your App Store account.
            </Text>

            <Text style={styles.paragraph}>
              Billing, renewals, cancellations, refunds, and payment processing
              are handled according to Apple's policies and terms.
            </Text>

            <Text style={styles.paragraph}>
              We do not directly process or store your payment card information.
            </Text>
          </Section>

          <Section number="5" title="User Content">
            <Text style={styles.paragraph}>
              You retain ownership of content you upload, including:
            </Text>

            <Bullet>Receipts</Bullet>
            <Bullet>Expense records</Bullet>
            <Bullet>Trip information</Bullet>
            <Bullet>Notes</Bullet>
            <Bullet>Documents</Bullet>

            <Text style={styles.paragraph}>
              By uploading content, you grant KarlsonWorks a limited license to
              store, process, and display such content solely for the purpose of
              operating and improving the Service.
            </Text>

            <Text style={styles.paragraph}>
              You are responsible for ensuring that you have the right to upload
              any content submitted to the Service.
            </Text>
          </Section>

          <Section number="6" title="Acceptable Use">
            <Text style={styles.paragraph}>You agree not to:</Text>

            <Bullet>Violate any applicable law or regulation</Bullet>
            <Bullet>
              Attempt to gain unauthorized access to the Service
            </Bullet>
            <Bullet>Interfere with or disrupt Service operations</Bullet>
            <Bullet>Upload malicious software or harmful content</Bullet>
            <Bullet>
              Use the Service for fraudulent or unlawful purposes
            </Bullet>
            <Bullet>
              Reverse engineer or attempt to extract source code except where
              permitted by law
            </Bullet>
          </Section>

          <Section number="7" title="Data Accuracy">
            <Text style={styles.paragraph}>
              Deduckly attempts to provide accurate mileage, location, and
              reporting information. However:
            </Text>

            <Bullet>GPS data may be inaccurate</Bullet>
            <Bullet>Location services may be interrupted</Bullet>
            <Bullet>Calculations may contain errors</Bullet>
            <Bullet>Reports may contain inaccuracies</Bullet>

            <Text style={styles.paragraph}>
              You are solely responsible for reviewing and verifying all records
              generated by the Service.
            </Text>
          </Section>

          <Section number="8" title="Tax Disclaimer">
              <Text style={styles.paragraph}>
              Deduckly is not a tax preparation service.
            </Text>

            <Text style={styles.paragraph}>
              Information, reports, mileage calculations, and expense summaries
              provided by Deduckly are for informational purposes only and
              should not be considered legal, tax, accounting, or financial
              advice.
            </Text>

            <Text style={styles.paragraph}>
              Users are responsible for verifying all information before
              submitting tax filings or financial documents.
            </Text>

            <Text style={styles.paragraph}>
              For professional advice, consult a qualified accountant, tax
              professional, or attorney.
            </Text>
          </Section>

          <Section number="9" title="Intellectual Property">
            <Text style={styles.paragraph}>
              The Service, including its design, software, logos, trademarks,
              graphics, and content, is owned by KarlsonWorks or its licensors
              and is protected by applicable intellectual property laws.
            </Text>

            <Text style={styles.paragraph}>
              You may not copy, modify, distribute, sell, or exploit any
              portion of the Service without prior written permission.
            </Text>
          </Section>

          <Section number="10" title="Advertising">
            <Text style={styles.paragraph}>
              The Service may display advertisements.
            </Text>

            <Text style={styles.paragraph}>
              We are not responsible for products, services, content, or claims
              made by third-party advertisers.
            </Text>

            <Text style={styles.paragraph}>
              Your interactions with advertisers are solely between you and the
              advertiser.
            </Text>
          </Section>

          <Section number="11" title="Service Availability">
            <Text style={styles.paragraph}>
              We strive to provide reliable access to the Service but do not
              guarantee uninterrupted availability.
            </Text>

            <Text style={styles.paragraph}>
              The Service may be modified, suspended, or discontinued at any
              time without notice.
            </Text>
          </Section>

          <Section number="12" title="Disclaimer of Warranties">
            <Text style={styles.paragraph}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE."
            </Text>

            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KARLSONWORKS DISCLAIMS ALL
              WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, AND ACCURACY.
            </Text>

            <Text style={styles.paragraph}>
              WE DO NOT GUARANTEE THAT THE SERVICE WILL BE ERROR-FREE, SECURE,
              OR AVAILABLE AT ALL TIMES.
            </Text>
          </Section>

          <Section number="13" title="Limitation of Liability">
            <Text style={styles.paragraph}>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, KARLSONWORKS SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE
              OF THE SERVICE.
            </Text>

            <Text style={styles.paragraph}>
              IN NO EVENT SHALL KARLSONWORKS' TOTAL LIABILITY EXCEED THE AMOUNT
              PAID BY YOU TO USE THE SERVICE DURING THE TWELVE (12) MONTHS
              PRECEDING THE CLAIM.
            </Text>
          </Section>

          <Section number="14" title="Indemnification">
            <Text style={styles.paragraph}>
              You agree to defend, indemnify, and hold harmless KarlsonWorks and
              its affiliates, employees, contractors, and representatives from
              any claims, liabilities, damages, losses, and expenses arising
              from:
            </Text>

            <Bullet>Your use of the Service</Bullet>
            <Bullet>Your violation of these Terms</Bullet>
            <Bullet>
              Your violation of any rights of another person or entity
            </Bullet>
          </Section>

          <Section number="15" title="Termination">
            <Text style={styles.paragraph}>
              You may stop using the Service at any time.
            </Text>

            <Text style={styles.paragraph}>
              We may suspend or terminate your access if:
            </Text>

            <Bullet>You violate these Terms</Bullet>
            <Bullet>
              We believe your use presents security or legal risks
            </Bullet>
            <Bullet>The Service is discontinued</Bullet>

            <Text style={styles.paragraph}>
              Termination does not affect any rights or obligations accrued
              before termination.
            </Text>
          </Section>

          <Section number="16" title="Governing Law">
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed under the laws of
              the State of Georgia, United States, without regard to conflict of
              law principles.
            </Text>
          </Section>

          <Section number="17" title="Changes to These Terms">
            <Text style={styles.paragraph}>
              We may update these Terms from time to time.
            </Text>

            <Text style={styles.paragraph}>
              Updated versions become effective when posted within the Service
              or otherwise made available to users.
            </Text>

            <Text style={styles.paragraph}>
              Continued use of the Service after changes become effective
              constitutes acceptance of the revised Terms.
            </Text>
          </Section>

          <Section number="18" title="Contact Information">
            <Text style={styles.paragraph}>
              Questions regarding these Terms may be directed to:
            </Text>

            <TouchableOpacity onPress={openEmail}>
              <Text style={styles.email}>support@karlsonworks.com</Text>
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