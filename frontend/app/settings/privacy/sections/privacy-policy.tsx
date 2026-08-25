import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import * as Linking from "expo-linking";

import { BackHeader } from "@/components/ui/BackButton";
import { useIsTablet } from "@/hooks/use-is-tablet";

const Privacy = () => {
  const isTablet = useIsTablet();
  const styles = getStyles(isTablet);

  const openEmail = () => {
    Linking.openURL("mailto:deducklysupport@karlsonworks.com");
  };

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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNumber}>{number}</Text>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

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
        <View style={styles.document}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Privacy Policy
            </Text>

            <Text style={styles.subtitle}>
              Effective Date: August 1, 2026
            </Text>

            <Text style={styles.appName}>
              Deduckly by KarlsonWorks
            </Text>

            <View style={styles.headerDivider} />
          </View>

          <Section number="1" title="Introduction">
            <Text style={styles.paragraph}>
              Thank you for using Deduckly ("Deduckly,"
              "we," "our," or "us"). Protecting your
              privacy is one of our highest priorities.
              This Privacy Policy explains how we
              collect, use, disclose, store, and protect
              your information when you use the Deduckly
              iOS application and related services.
            </Text>

            <Text style={styles.paragraph}>
              Deduckly is designed for gig workers,
              freelancers, self-employed individuals,
              independent contractors, and small
              businesses to help track mileage,
              expenses, business deductions, and related
              financial records.
            </Text>

            <Text style={styles.paragraph}>
              By using Deduckly, you acknowledge that you
              have read and understood this Privacy Policy.
            </Text>
          </Section>

          <Section
            number="2"
            title="Information We Collect"
          >
            <Text style={styles.subHeader}>
              Account Information
            </Text>

            <Text style={styles.bullet}>
              • Name (when provided by your
              authentication provider)
            </Text>

            <Text style={styles.bullet}>
              • Email address
            </Text>

            <Text style={styles.bullet}>
              • Authentication provider information
            </Text>

            <Text style={styles.bullet}>
              • Secure authentication tokens and session
              information
            </Text>

            <Text style={styles.subHeader}>
              Location Information
            </Text>

            <Text style={styles.paragraph}>
              Deduckly requests location access to provide
              mileage tracking functionality.
            </Text>

            <Text style={styles.bullet}>
              • Background location tracking for automatic
              mileage tracking
            </Text>

            <Text style={styles.bullet}>
              • Foreground location while using the app
            </Text>

            <Text style={styles.bullet}>
              • GPS routes associated with trips
            </Text>

            <Text style={styles.bullet}>
              • Trip start and end locations
            </Text>

            <Text style={styles.bullet}>
              • Manual trip tracking information
            </Text>

            <Text style={styles.bullet}>
              • Mileage calculations
            </Text>

            <Text style={styles.bullet}>
              • Trip history
            </Text>

            <Text style={styles.paragraph}>
              Background location access is used only to
              provide automatic mileage tracking
              functionality when enabled by you.
            </Text>

            <Text style={styles.subHeader}>
              Expense Information
            </Text>

            <Text style={styles.bullet}>
              • Expense records
            </Text>

            <Text style={styles.bullet}>
              • Expense categories
            </Text>

            <Text style={styles.bullet}>
              • Business deduction estimates
            </Text>

            <Text style={styles.bullet}>
              • Receipt uploads
            </Text>

            <Text style={styles.bullet}>
              • Receipt images stored securely using
              Amazon Web Services (AWS S3)
            </Text>

            <Text style={styles.subHeader}>
              Generated Documents
            </Text>

            <Text style={styles.bullet}>
              • Tax reports
            </Text>

            <Text style={styles.bullet}>
              • PDF exports
            </Text>

            <Text style={styles.bullet}>
              • CSV exports
            </Text>

            <Text style={styles.subHeader}>
              Subscription Information
            </Text>

            <Text style={styles.paragraph}>
              Subscription purchases are processed by
              Apple through the App Store. Deduckly does
              not receive or store your payment card
              information.
            </Text>

            <Text style={styles.bullet}>
              • Apple In-App Purchases
            </Text>

            <Text style={styles.bullet}>
              • RevenueCat subscription status
            </Text>

            <Text style={styles.subHeader}>
              Technical Information
            </Text>

            <Text style={styles.bullet}>
              • Device information
            </Text>

            <Text style={styles.bullet}>
              • App version
            </Text>

            <Text style={styles.bullet}>
              • Crash information
            </Text>

            <Text style={styles.bullet}>
              • Security logging
            </Text>

            <Text style={styles.bullet}>
              • Fraud prevention information
            </Text>
          </Section>

          <Section
            number="3"
            title="How We Use Information"
          >
            <Text style={styles.paragraph}>
              We use your information to:
            </Text>

            <Text style={styles.bullet}>
              • Create and maintain your account
            </Text>

            <Text style={styles.bullet}>
              • Authenticate your identity
            </Text>

            <Text style={styles.bullet}>
              • Maintain secure sessions
            </Text>

            <Text style={styles.bullet}>
              • Provide automatic mileage tracking
            </Text>

            <Text style={styles.bullet}>
              • Support manual trip tracking
            </Text>

            <Text style={styles.bullet}>
              • Calculate mileage
            </Text>

            <Text style={styles.bullet}>
              • Generate business deduction estimates
            </Text>

            <Text style={styles.bullet}>
              • Store and organize expenses
            </Text>

            <Text style={styles.bullet}>
              • Store receipt images
            </Text>

            <Text style={styles.bullet}>
              • Generate tax reports
            </Text>

            <Text style={styles.bullet}>
              • Produce PDF exports
            </Text>

            <Text style={styles.bullet}>
              • Produce CSV exports
            </Text>

            <Text style={styles.bullet}>
              • Improve application reliability
            </Text>

            <Text style={styles.bullet}>
              • Detect abuse and fraud
            </Text>

            <Text style={styles.bullet}>
              • Comply with applicable legal obligations
            </Text>
          </Section>

          <Section
            number="4"
            title="Third-Party Services"
          >
            <Text style={styles.paragraph}>
              Deduckly uses carefully selected third-party
              providers to operate core functionality.
            </Text>

            <Text style={styles.bullet}>
              • DigitalOcean Droplets for application
              hosting
            </Text>

            <Text style={styles.bullet}>
              • DigitalOcean Managed Database for secure
              application data storage
            </Text>

            <Text style={styles.bullet}>
              • Amazon Web Services (AWS S3) for secure
              receipt storage
            </Text>

            <Text style={styles.bullet}>
              • Google OAuth for optional account
              authentication
            </Text>

            <Text style={styles.bullet}>
              • Sign in with Apple
            </Text>

            <Text style={styles.bullet}>
              • Apple In-App Purchases
            </Text>

            <Text style={styles.bullet}>
              • RevenueCat for subscription management
            </Text>

            <Text style={styles.paragraph}>
              Each provider processes information only as
              necessary to deliver the services they
              provide.
            </Text>
          </Section>

          <Section
            number="5"
            title="Advertising & Analytics"
          >
            <Text style={styles.paragraph}>
              Deduckly is not designed around advertising.
            </Text>

            <Text style={styles.paragraph}>
              We do not sell your personal information to
              advertisers.
            </Text>

            <Text style={styles.paragraph}>
              We may use limited operational and security
              logging to improve application reliability,
              detect abuse, investigate technical issues,
              and help prevent fraud.
            </Text>
          </Section>

          <Section number="6" title="Data Retention">
            <Text style={styles.paragraph}>
              We retain your information only for as long
              as reasonably necessary to:
            </Text>

            <Text style={styles.bullet}>
              • Maintain your account
            </Text>

            <Text style={styles.bullet}>
              • Provide requested services
            </Text>

            <Text style={styles.bullet}>
              • Meet legal obligations
            </Text>

            <Text style={styles.bullet}>
              • Resolve disputes
            </Text>

            <Text style={styles.bullet}>
              • Prevent fraud and abuse
            </Text>

            <Text style={styles.paragraph}>
              When information is no longer required, we
              take reasonable steps to securely delete or
              anonymize it where appropriate.
            </Text>
          </Section>

          <Section
            number="7"
            title="Account & Data Deletion"
          >
            <Text style={styles.paragraph}>
              You may request deletion of your Deduckly
              account and associated personal data.
            </Text>

            <Text style={styles.paragraph}>
              Following a verified deletion request, we
              will remove or anonymize applicable personal
              information, except where retention is
              required by law, necessary for fraud
              prevention, security, dispute resolution,
              or other legitimate legal obligations.
            </Text>
          </Section>

          <Section number="8" title="Data Security">
            <Text style={styles.paragraph}>
              We implement reasonable administrative,
              technical, and organizational safeguards to
              protect your information.
            </Text>

            <Text style={styles.bullet}>
              • TLS encryption for data transmitted over
              networks
            </Text>

            <Text style={styles.bullet}>
              • Secure authentication tokens
            </Text>

            <Text style={styles.bullet}>
              • Secure user sessions
            </Text>

            <Text style={styles.bullet}>
              • Access controls
            </Text>

            <Text style={styles.bullet}>
              • Security logging
            </Text>

            <Text style={styles.bullet}>
              • Fraud prevention measures
            </Text>

            <Text style={styles.paragraph}>
              While no system can guarantee absolute
              security, we continually work to protect your
              information using commercially reasonable
              security practices.
            </Text>
          </Section>

          <Section
            number="9"
            title="Children's Privacy"
          >
            <Text style={styles.paragraph}>
              Deduckly is not intended for children under 13
              years of age and is not directed toward
              children. We do not knowingly collect
              personal information from children.
            </Text>

            <Text style={styles.paragraph}>
              If we become aware that personal information
              from a child has been collected, we will take
              reasonable steps to delete it.
            </Text>
          </Section>

          <Section
            number="10"
            title="Your Privacy Rights (GDPR, CCPA/CPRA)"
          >
            <Text style={styles.paragraph}>
              Depending on your location, applicable
              privacy laws may provide additional rights
              regarding your personal information.
            </Text>

            <Text style={styles.bullet}>
              • Access your personal information
            </Text>

            <Text style={styles.bullet}>
              • Correct inaccurate information
            </Text>

            <Text style={styles.bullet}>
              • Request deletion where applicable
            </Text>

            <Text style={styles.bullet}>
              • Request data portability where applicable
            </Text>

            <Text style={styles.bullet}>
              • Object to or restrict certain processing
              where permitted by law
            </Text>

            <Text style={styles.bullet}>
              • Exercise applicable rights under GDPR
            </Text>

            <Text style={styles.bullet}>
              • Exercise applicable rights under CCPA and
              CPRA
            </Text>

            <Text style={styles.paragraph}>
              We do not sell personal information as defined
              by the California Consumer Privacy Act.
            </Text>
          </Section>

          <Section
            number="11"
            title="International Users"
          >
            <Text style={styles.paragraph}>
              If you access Deduckly from outside the
              country in which our infrastructure operates,
              your information may be transferred to,
              processed, and stored in jurisdictions that
              may have different data protection laws than
              those in your country.
            </Text>
          </Section>

          <Section
            number="12"
            title="Tax & Financial Disclaimer"
          >
            <Text style={styles.paragraph}>
              Deduckly is provided as a recordkeeping and
              organizational tool.
            </Text>

            <Text style={styles.paragraph}>
              Business deduction estimates, mileage
              calculations, reports, PDF exports, CSV
              exports, and related information are provided
              for informational purposes only.
            </Text>

            <Text style={styles.paragraph}>
              Deduckly does not provide legal, tax,
              accounting, or financial advice. You are
              solely responsible for verifying records and
              consulting qualified professionals regarding
              tax filings, deductions, compliance, and
              financial decisions.
            </Text>
          </Section>

          <Section
            number="13"
            title="Changes to this Privacy Policy"
          >
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to
              time to reflect changes in our practices, legal
              requirements, or application features.
            </Text>

            <Text style={styles.paragraph}>
              Updates become effective when the revised
              Privacy Policy is published within the
              application unless otherwise required by law.
            </Text>
          </Section>

          <Section
            number="14"
            title="Contact Information"
          >
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy
              or your personal information, please contact
              us:
            </Text>

            <TouchableOpacity
              onPress={openEmail}
              activeOpacity={0.7}
              style={styles.emailButton}
            >
              <Text style={styles.email}>
                deducklysupport@karlsonworks.com
              </Text>
            </TouchableOpacity>

            <Text style={styles.paragraph}>
              Deduckly is designed to comply with applicable
              Apple App Store privacy requirements and
              applicable privacy laws, including GDPR, CCPA,
              and CPRA where applicable.
            </Text>
          </Section>

          <View style={styles.footer}>
            <View style={styles.footerDivider} />

            <Text style={styles.footerText}>
              Deduckly by KarlsonWorks
            </Text>

            <Text style={styles.footerDate}>
              Privacy Policy • Effective August 1, 2026
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Privacy;

const getStyles = (isTablet: boolean) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingHorizontal: isTablet ? 32 : 20,
      paddingTop: isTablet ? 28 : 18,
      paddingBottom: isTablet ? 64 : 44,
    },

    document: {
      width: "100%",
      maxWidth: isTablet ? 900 : undefined,
      alignSelf: "center",
    },

    header: {
      paddingBottom: isTablet ? 30 : 24,
    },

    title: {
      fontSize: isTablet ? 40 : 34,
      lineHeight: isTablet ? 48 : 41,
      fontWeight: "800",
      color: "#1C1C1E",
      letterSpacing: -0.8,
      marginBottom: 8,
    },

    subtitle: {
      fontSize: isTablet ? 15 : 14,
      color: "#6E6E73",
      marginBottom: 7,
    },

    appName: {
      fontSize: isTablet ? 18 : 17,
      fontWeight: "700",
      color: "#2DBE60",
    },

    headerDivider: {
      height: 1,
      backgroundColor: "#DDE2E7",
      marginTop: isTablet ? 26 : 22,
    },

    section: {
      marginBottom: isTablet ? 34 : 28,
    },

    sectionHeader: {
      flexDirection: "row",
      alignItems: "baseline",
      marginBottom: isTablet ? 16 : 13,
    },

    sectionNumber: {
      fontSize: isTablet ? 15 : 13,
      lineHeight: isTablet ? 20 : 18,
      fontWeight: "800",
      color: "#2DBE60",
      marginRight: 9,
      minWidth: isTablet ? 24 : 21,
    },

    sectionTitle: {
      flex: 1,
      fontSize: isTablet ? 23 : 21,
      lineHeight: isTablet ? 29 : 27,
      fontWeight: "800",
      color: "#1C1C1E",
      letterSpacing: -0.25,
    },

    subHeader: {
      fontSize: isTablet ? 17 : 16,
      lineHeight: isTablet ? 24 : 22,
      fontWeight: "700",
      color: "#1C1C1E",
      marginTop: 8,
      marginBottom: 8,
    },

    paragraph: {
      fontSize: isTablet ? 16 : 15,
      lineHeight: isTablet ? 27 : 25,
      color: "#4B5563",
      marginBottom: 13,
    },

    bullet: {
      fontSize: isTablet ? 16 : 15,
      lineHeight: isTablet ? 27 : 25,
      color: "#4B5563",
      marginBottom: 7,
      paddingLeft: 2,
    },

    emailButton: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      marginTop: 0,
      marginBottom: 15,
    },

    email: {
      fontSize: isTablet ? 16 : 15,
      lineHeight: 23,
      fontWeight: "700",
      color: "#2DBE60",
      textDecorationLine: "underline",
    },

    footer: {
      paddingTop: 2,
      paddingBottom: 10,
    },

    footerDivider: {
      height: 1,
      backgroundColor: "#DDE2E7",
      marginBottom: 18,
    },

    footerText: {
      fontSize: 13,
      fontWeight: "700",
      color: "#6E6E73",
      textAlign: "center",
    },

    footerDate: {
      marginTop: 5,
      fontSize: 12,
      color: "#9CA3AF",
      textAlign: "center",
    },
  });