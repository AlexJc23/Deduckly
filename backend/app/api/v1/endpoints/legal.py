from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(
    prefix="/legal",
    tags=["legal"],
)


@router.get("/privacy", response_class=HTMLResponse)
def privacy_policy():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deduckly Privacy Policy</title>

    <style>
        body {
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1C1C1E;
            background: #F5F7FA;
        }

        main {
            background: #FFFFFF;
            padding: 40px;
            border-radius: 16px;
        }

        h1 {
            margin-bottom: 8px;
        }

        h2 {
            margin-top: 32px;
            color: #2DBE60;
        }

        h3 {
            margin-top: 24px;
            color: #1C1C1E;
        }

        .subtitle {
            color: #6E6E73;
        }

        .app-name {
            font-size: 20px;
            font-weight: 700;
            color: #2DBE60;
        }

        p {
            margin-bottom: 16px;
        }

        li {
            margin-bottom: 8px;
        }

        a {
            color: #2DBE60;
        }
    </style>
</head>

<body>
<main>

<h1>Privacy Policy</h1>

<p class="subtitle">
    Effective Date: August 1, 2026
</p>

<p class="app-name">
    Deduckly by KarlsonWorks
</p>


<h2>1. Introduction</h2>

<p>
Thank you for using Deduckly ("Deduckly," "we," "our," or "us").
Protecting your privacy is one of our highest priorities. This Privacy
Policy explains how we collect, use, disclose, store, and protect your
information when you use the Deduckly iOS application and related services.
</p>

<p>
Deduckly is designed for gig workers, freelancers, self-employed individuals,
independent contractors, and small businesses to help track mileage,
expenses, business deductions, and related financial records.
</p>

<p>
By using Deduckly, you acknowledge that you have read and understood this
Privacy Policy.
</p>


<h2>2. Information We Collect</h2>

<h3>Account Information</h3>

<ul>
    <li>Name (when provided by your authentication provider)</li>
    <li>Email address</li>
    <li>Authentication provider information</li>
    <li>Secure authentication tokens and session information</li>
</ul>

<h3>Location Information</h3>

<p>
Deduckly requests location access to provide mileage tracking functionality.
</p>

<ul>
    <li>Background location tracking for automatic mileage tracking</li>
    <li>Foreground location while using the app</li>
    <li>GPS routes associated with trips</li>
    <li>Trip start and end locations</li>
    <li>Manual trip tracking information</li>
    <li>Mileage calculations</li>
    <li>Trip history</li>
</ul>

<p>
Background location access is used only to provide automatic mileage tracking
functionality when enabled by you.
</p>

<h3>Expense Information</h3>

<ul>
    <li>Expense records</li>
    <li>Expense categories</li>
    <li>Business deduction estimates</li>
    <li>Receipt uploads</li>
    <li>
        Receipt images stored securely using Amazon Web Services (AWS S3)
    </li>
</ul>

<h3>Generated Documents</h3>

<ul>
    <li>Tax reports</li>
    <li>PDF exports</li>
    <li>CSV exports</li>
</ul>

<h3>Subscription Information</h3>

<p>
Subscription purchases are processed by Apple through the App Store.
Deduckly does not receive or store your payment card information.
</p>

<ul>
    <li>Apple In-App Purchases</li>
    <li>RevenueCat subscription status</li>
</ul>

<h3>Technical Information</h3>

<ul>
    <li>Device information</li>
    <li>App version</li>
    <li>Crash information</li>
    <li>Security logging</li>
    <li>Fraud prevention information</li>
</ul>


<h2>3. How We Use Information</h2>

<p>
We use your information to:
</p>

<ul>
    <li>Create and maintain your account</li>
    <li>Authenticate your identity</li>
    <li>Maintain secure sessions</li>
    <li>Provide automatic mileage tracking</li>
    <li>Support manual trip tracking</li>
    <li>Calculate mileage</li>
    <li>Generate business deduction estimates</li>
    <li>Store and organize expenses</li>
    <li>Store receipt images</li>
    <li>Generate tax reports</li>
    <li>Produce PDF exports</li>
    <li>Produce CSV exports</li>
    <li>Improve application reliability</li>
    <li>Detect abuse and fraud</li>
    <li>Comply with applicable legal obligations</li>
</ul>


<h2>4. Third-Party Services</h2>

<p>
Deduckly uses carefully selected third-party providers to operate
core functionality.
</p>

<ul>
    <li>
        DigitalOcean Droplets for application hosting
    </li>

    <li>
        DigitalOcean Managed Database for secure application data storage
    </li>

    <li>
        Amazon Web Services (AWS S3) for secure receipt storage
    </li>

    <li>
        Google OAuth for optional account authentication
    </li>

    <li>
        Sign in with Apple
    </li>

    <li>
        Apple In-App Purchases
    </li>

    <li>
        RevenueCat for subscription management
    </li>
</ul>

<p>
Each provider processes information only as necessary to deliver the services
they provide.
</p>


<h2>5. Advertising &amp; Analytics</h2>

<p>
Deduckly is not designed around advertising.
</p>

<p>
We do not sell your personal information to advertisers.
</p>

<p>
We may use limited operational and security logging to improve application
reliability, detect abuse, investigate technical issues, and help prevent
fraud.
</p>


<h2>6. Data Retention</h2>

<p>
We retain your information only for as long as reasonably necessary to:
</p>

<ul>
    <li>Maintain your account</li>
    <li>Provide requested services</li>
    <li>Meet legal obligations</li>
    <li>Resolve disputes</li>
    <li>Prevent fraud and abuse</li>
</ul>

<p>
When information is no longer required, we take reasonable steps to securely
delete or anonymize it where appropriate.
</p>


<h2>7. Account &amp; Data Deletion</h2>

<p>
You may request deletion of your Deduckly account and associated personal
data.
</p>

<p>
Following a verified deletion request, we will remove or anonymize applicable
personal information, except where retention is required by law, necessary
for fraud prevention, security, dispute resolution, or other legitimate legal
obligations.
</p>


<h2>8. Data Security</h2>

<p>
We implement reasonable administrative, technical, and organizational
safeguards to protect your information.
</p>

<ul>
    <li>TLS encryption for data transmitted over networks</li>
    <li>Secure authentication tokens</li>
    <li>Secure user sessions</li>
    <li>Access controls</li>
    <li>Security logging</li>
    <li>Fraud prevention measures</li>
</ul>

<p>
While no system can guarantee absolute security, we continually work to
protect your information using commercially reasonable security practices.
</p>


<h2>9. Children's Privacy</h2>

<p>
Deduckly is not intended for children under 13 years of age and is not
directed toward children. We do not knowingly collect personal information
from children.
</p>

<p>
If we become aware that personal information from a child has been collected,
we will take reasonable steps to delete it.
</p>


<h2>10. Your Privacy Rights (GDPR, CCPA/CPRA)</h2>

<p>
Depending on your location, applicable privacy laws may provide additional
rights regarding your personal information.
</p>

<ul>
    <li>Access your personal information</li>
    <li>Correct inaccurate information</li>
    <li>Request deletion where applicable</li>
    <li>Request data portability where applicable</li>
    <li>
        Object to or restrict certain processing where permitted by law
    </li>
    <li>Exercise applicable rights under GDPR</li>
    <li>Exercise applicable rights under CCPA and CPRA</li>
</ul>

<p>
We do not sell personal information as defined by the California Consumer
Privacy Act.
</p>


<h2>11. International Users</h2>

<p>
If you access Deduckly from outside the country in which our infrastructure
operates, your information may be transferred to, processed, and stored in
jurisdictions that may have different data protection laws than those in
your country.
</p>


<h2>12. Tax &amp; Financial Disclaimer</h2>

<p>
Deduckly is provided as a recordkeeping and organizational tool.
</p>

<p>
Business deduction estimates, mileage calculations, reports, PDF exports,
CSV exports, and related information are provided for informational purposes
only.
</p>

<p>
Deduckly does not provide legal, tax, accounting, or financial advice.
You are solely responsible for verifying records and consulting qualified
professionals regarding tax filings, deductions, compliance, and financial
decisions.
</p>


<h2>13. Changes to this Privacy Policy</h2>

<p>
We may update this Privacy Policy from time to time to reflect changes in
our practices, legal requirements, or application features.
</p>

<p>
Updates become effective when the revised Privacy Policy is published within
the application unless otherwise required by law.
</p>


<h2>14. Contact Information</h2>

<p>
If you have questions about this Privacy Policy or your personal information,
please contact us:
</p>

<p>
<a href="mailto:deducklysupport@karlsonworks.com">
    deducklysupport@karlsonworks.com
</a>
</p>

<p>
Deduckly is designed to comply with applicable Apple App Store privacy
requirements and applicable privacy laws, including GDPR, CCPA, and CPRA
where applicable.
</p>

</main>
</body>
</html>
"""


@router.get("/support", response_class=HTMLResponse)
def support_page():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deduckly Support</title>

    <style>
        body {
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.6;
            color: #1C1C1E;
            background: #F5F7FA;
        }

        main {
            background: #FFFFFF;
            padding: 40px;
            border-radius: 16px;
        }

        h1 {
            margin-bottom: 24px;
        }

        h2 {
            margin-top: 32px;
        }

        a {
            color: #2DBE60;
        }
    </style>
</head>

<body>
<main>

<h1>Deduckly Support</h1>

<p>
Need help with Deduckly? Contact our support team.
</p>

<h2>Contact Support</h2>

<p>
<a href="mailto:deducklysupport@karlsonworks.com">
deducklysupport@karlsonworks.com
</a>
</p>

<h2>About Deduckly</h2>

<p>
Deduckly helps gig workers, freelancers, self-employed individuals,
independent contractors, and small businesses track mileage, expenses,
income, and business-related records.
</p>

<h2>When Contacting Support</h2>

<p>
Please include the email address associated with your Deduckly account,
your device and iOS version, a description of the issue, and screenshots
when helpful.
</p>

</main>
</body>
</html>
"""
