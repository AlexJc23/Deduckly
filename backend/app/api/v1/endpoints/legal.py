from fastapi import APIRouter
from fastapi.responses import HTMLResponse

router = APIRouter(
    prefix="/legal",
    tags=["legal"],
)

public_router = APIRouter(prefix="/deduckly", tags=["legal"])


@public_router.get("/privacy", response_class=HTMLResponse)
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
:root { color-scheme: light; --blue:#0072B5; --ink:#273449; --muted:#64748B; --line:#DDE4ED; }
* { box-sizing:border-box; }
body { margin:0; background:#F7F9FC; color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; -webkit-font-smoothing:antialiased; }
a { color:var(--blue); text-underline-offset:4px; }
a:focus-visible,summary:focus-visible { outline:3px solid var(--blue); outline-offset:5px; border-radius:4px; }
.wrap { max-width:1080px; margin:auto; padding:0 32px; }
header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:30px 0; border-bottom:1px solid var(--line); }
.brand { display:flex; align-items:center; gap:11px; font-size:23px; font-weight:700; letter-spacing:-.7px; }
.logo { width:34px; height:35px; color:var(--blue); }
nav { display:flex; gap:24px; font-size:14px; } nav a { text-decoration:none; }
.hero { padding:72px 0 44px; max-width:740px; }
.eyebrow { color:var(--blue); font-size:14px; font-weight:600; margin:0 0 16px; }
h1 { margin:0; font-size:clamp(36px,5.8vw,60px); line-height:1.08; letter-spacing:-2px; font-weight:700; }
.lead { max-width:610px; margin:22px 0 0; color:var(--muted); font-size:18px; line-height:1.65; }
.grid { display:grid; grid-template-columns:1.1fr 1fr; gap:24px; align-items:start; }
.card { padding:32px; border:1px solid var(--line); border-radius:20px; background:white; }
h2 { margin:0 0 14px; font-size:24px; letter-spacing:-.6px; } p,li { font-size:15px; line-height:1.7; color:var(--muted); }
.card p { margin:0 0 24px; }
.button { display:inline-flex; min-height:50px; align-items:center; justify-content:center; gap:12px; padding:12px 22px; border-radius:12px; background:var(--blue); color:white; text-decoration:none; font-size:15px; font-weight:600; }
.button:hover { background:#005E96; }
.email { display:block; margin-top:18px; font-size:14px; overflow-wrap:anywhere; }
ul { padding-left:20px; margin:18px 0 0; } li+li { margin-top:10px; }
.help { padding:52px 0 20px; }
.help>p { margin:0 0 22px; }
details { border-top:1px solid var(--line); padding:0 4px; }
details:last-child { border-bottom:1px solid var(--line); }
summary { padding:21px 0; cursor:pointer; font-size:16px; font-weight:600; }
details p { max-width:760px; margin:0 0 24px; }
footer { padding:30px 0; margin-top:30px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:16px; font-size:13px; color:var(--muted); }
footer a { text-decoration:none; }
@media(max-width:650px) { .wrap { padding:0 22px; } header { padding:22px 0; } nav { gap:16px; } .hero { padding:44px 0 30px; } h1 { letter-spacing:-1.1px; } .lead { font-size:16px; } .grid { grid-template-columns:1fr; gap:16px; } .card { padding:24px; border-radius:16px; } .button { width:100%; } .help { padding-top:36px; } }

.policy { max-width:800px; margin:0 auto; background:white; padding:44px; border:1px solid var(--line); border-radius:20px; }
.policy h1 { font-size:clamp(32px,5vw,48px); letter-spacing:-1.4px; margin-bottom:18px; }
.policy h2 { color:var(--ink); font-size:23px; line-height:1.35; margin-top:38px; scroll-margin-top:24px; }
.policy h3 { font-size:18px; margin-top:28px; }
.policy p,.policy li { font-size:16px; line-height:1.8; }
.policy a { overflow-wrap:anywhere; }
.subtitle { font-size:14px!important; }
.app-name { font-weight:600; color:var(--blue); }
.policy-layout { padding-top:40px; }
.contents { max-width:800px; margin:0 auto 24px; padding:24px 28px; background:#EAF3FA; border-radius:16px; }
.contents summary { padding:0; }
.contents ol { columns:2; padding-left:22px; margin-bottom:0; }
.contents li { break-inside:avoid; padding:5px 12px 5px 0; font-size:14px; }
@media(max-width:650px) { .policy { padding:24px; border-radius:16px; } .policy-layout { padding-top:24px; } .policy h2 { font-size:21px; } .contents ol { columns:1; } }
</style>
</head>

<body>
<div class="wrap"><header><div class="brand"><svg aria-hidden="true" class="logo" width="468" height="474" viewBox="0 0 468 474" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M270.062 182.257C266.784 155.554 249.38 158.146 239.866 163.493C239.288 163.818 238.793 164.271 238.435 164.83C233.524 172.489 233.062 186.074 265.227 187.396C268.08 187.513 270.41 185.091 270.062 182.257Z" fill="currentColor" stroke="currentColor"/>
<path d="M0.5 467.5V5.5C0.5 2.73858 2.73858 0.5 5.5 0.5H274.122C274.374 0.5 274.626 0.519089 274.875 0.557351C324.702 8.22613 365.035 33.3625 379 45C478.33 114.412 473.527 245.952 458.622 303.533C458.539 303.854 458.493 304.149 458.47 304.48C457.24 322.344 442.757 368.829 394 416C346.099 462.343 267.139 472.951 230.856 472.556C229.077 472.537 227.471 471.541 226.647 469.964C203.46 425.613 199.855 371.414 201 349.5C213.4 271.1 262.5 248.5 285.5 247C308.5 248.667 360.4 251 384 247C402.958 243.787 411.57 235.626 414.656 229.776C415.753 227.696 414.41 225.386 412.218 224.533C352.209 201.196 322.815 186.869 313.721 181.552C312.597 180.895 311.851 179.81 311.531 178.548C303.241 145.772 267.446 87.1691 185.5 100.5C101.9 114.1 75.3333 174.167 72.5 202.5V467.5C72.5 470.261 70.2614 472.5 67.5 472.5H5.5C2.73858 472.5 0.5 470.261 0.5 467.5Z" fill="currentColor" stroke="currentColor"/>
</svg>
<span>Deduckly</span></div><nav aria-label="Main navigation"><a href="/deduckly/support">Support</a><a href="/deduckly/privacy" aria-current="page">Privacy</a></nav></header><div class="policy-layout"><details class="contents"><summary>In this policy</summary><ol><li><a href="#section-1">Introduction</a></li><li><a href="#section-2">Information We Collect</a></li><li><a href="#section-3">How We Use Information</a></li><li><a href="#section-4">Third-Party Services</a></li><li><a href="#section-5">Advertising &amp; Analytics</a></li><li><a href="#section-6">Data Retention</a></li><li><a href="#section-7">Account &amp; Data Deletion</a></li><li><a href="#section-8">Data Security</a></li><li><a href="#section-9">Children's Privacy</a></li><li><a href="#section-10">Your Privacy Rights (GDPR, CCPA/CPRA)</a></li><li><a href="#section-11">International Users</a></li><li><a href="#section-12">Tax &amp; Financial Disclaimer</a></li><li><a href="#section-13">Changes to this Privacy Policy</a></li><li><a href="#section-14">Contact Information</a></li></ol></details><main class="policy">

<h1>Deduckly Privacy Policy</h1>

<p class="subtitle">
    Effective Date: August 1, 2026
</p>

<p class="app-name">
    Deduckly by KarlsonWorks
</p>


<h2 id="section-1">1. Introduction</h2>

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


<h2 id="section-2">2. Information We Collect</h2>

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


<h2 id="section-3">3. How We Use Information</h2>

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


<h2 id="section-4">4. Third-Party Services</h2>

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


<h2 id="section-5">5. Advertising &amp; Analytics</h2>

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


<h2 id="section-6">6. Data Retention</h2>

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


<h2 id="section-7">7. Account &amp; Data Deletion</h2>

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


<h2 id="section-8">8. Data Security</h2>

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


<h2 id="section-9">9. Children's Privacy</h2>

<p>
Deduckly is not intended for children under 13 years of age and is not
directed toward children. We do not knowingly collect personal information
from children.
</p>

<p>
If we become aware that personal information from a child has been collected,
we will take reasonable steps to delete it.
</p>


<h2 id="section-10">10. Your Privacy Rights (GDPR, CCPA/CPRA)</h2>

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


<h2 id="section-11">11. International Users</h2>

<p>
If you access Deduckly from outside the country in which our infrastructure
operates, your information may be transferred to, processed, and stored in
jurisdictions that may have different data protection laws than those in
your country.
</p>


<h2 id="section-12">12. Tax &amp; Financial Disclaimer</h2>

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


<h2 id="section-13">13. Changes to this Privacy Policy</h2>

<p>
We may update this Privacy Policy from time to time to reflect changes in
our practices, legal requirements, or application features.
</p>

<p>
Updates become effective when the revised Privacy Policy is published within
the application unless otherwise required by law.
</p>


<h2 id="section-14">14. Contact Information</h2>

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

</main></div><footer><span>Deduckly · Your miles, money, and work.</span><a href="/deduckly/support">Deduckly Support</a></footer></div>
</body>
</html>
"""


@public_router.get("/support", response_class=HTMLResponse)
@router.get("/support", response_class=HTMLResponse)
def support_page():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Get help with Deduckly, from your first trip to your account and reports. Contact the Deduckly support team.">
<title>Support · Deduckly</title>
<style>
:root { color-scheme: light; --blue:#0072B5; --ink:#273449; --muted:#64748B; --line:#DDE4ED; }
* { box-sizing:border-box; }
body { margin:0; background:#F7F9FC; color:var(--ink); font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; -webkit-font-smoothing:antialiased; }
a { color:var(--blue); text-underline-offset:4px; }
a:focus-visible,summary:focus-visible { outline:3px solid var(--blue); outline-offset:5px; border-radius:4px; }
.wrap { max-width:1080px; margin:auto; padding:0 32px; }
header { display:flex; align-items:center; justify-content:space-between; gap:24px; padding:30px 0; border-bottom:1px solid var(--line); }
.brand { display:flex; align-items:center; gap:11px; font-size:23px; font-weight:700; letter-spacing:-.7px; }
.logo { width:34px; height:35px; color:var(--blue); }
nav { display:flex; gap:24px; font-size:14px; } nav a { text-decoration:none; }
.hero { padding:72px 0 44px; max-width:740px; }
.eyebrow { color:var(--blue); font-size:14px; font-weight:600; margin:0 0 16px; }
h1 { margin:0; font-size:clamp(36px,5.8vw,60px); line-height:1.08; letter-spacing:-2px; font-weight:700; }
.lead { max-width:610px; margin:22px 0 0; color:var(--muted); font-size:18px; line-height:1.65; }
.grid { display:grid; grid-template-columns:1.1fr 1fr; gap:24px; align-items:start; }
.card { padding:32px; border:1px solid var(--line); border-radius:20px; background:white; }
h2 { margin:0 0 14px; font-size:24px; letter-spacing:-.6px; } p,li { font-size:15px; line-height:1.7; color:var(--muted); }
.card p { margin:0 0 24px; }
.button { display:inline-flex; min-height:50px; align-items:center; justify-content:center; gap:12px; padding:12px 22px; border-radius:12px; background:var(--blue); color:white; text-decoration:none; font-size:15px; font-weight:600; }
.button:hover { background:#005E96; }
.email { display:block; margin-top:18px; font-size:14px; overflow-wrap:anywhere; }
ul { padding-left:20px; margin:18px 0 0; } li+li { margin-top:10px; }
.help { padding:52px 0 20px; }
.help>p { margin:0 0 22px; }
details { border-top:1px solid var(--line); padding:0 4px; }
details:last-child { border-bottom:1px solid var(--line); }
summary { padding:21px 0; cursor:pointer; font-size:16px; font-weight:600; }
details p { max-width:760px; margin:0 0 24px; }
footer { padding:30px 0; margin-top:30px; display:flex; flex-wrap:wrap; justify-content:space-between; gap:16px; font-size:13px; color:var(--muted); }
footer a { text-decoration:none; }
@media(max-width:650px) { .wrap { padding:0 22px; } header { padding:22px 0; } nav { gap:16px; } .hero { padding:44px 0 30px; } h1 { letter-spacing:-1.1px; } .lead { font-size:16px; } .grid { grid-template-columns:1fr; gap:16px; } .card { padding:24px; border-radius:16px; } .button { width:100%; } .help { padding-top:36px; } }
</style>
</head>
<body>
<div class="wrap">
<header><div class="brand"><svg aria-hidden="true" class="logo" width="468" height="474" viewBox="0 0 468 474" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M270.062 182.257C266.784 155.554 249.38 158.146 239.866 163.493C239.288 163.818 238.793 164.271 238.435 164.83C233.524 172.489 233.062 186.074 265.227 187.396C268.08 187.513 270.41 185.091 270.062 182.257Z" fill="currentColor" stroke="currentColor"/>
<path d="M0.5 467.5V5.5C0.5 2.73858 2.73858 0.5 5.5 0.5H274.122C274.374 0.5 274.626 0.519089 274.875 0.557351C324.702 8.22613 365.035 33.3625 379 45C478.33 114.412 473.527 245.952 458.622 303.533C458.539 303.854 458.493 304.149 458.47 304.48C457.24 322.344 442.757 368.829 394 416C346.099 462.343 267.139 472.951 230.856 472.556C229.077 472.537 227.471 471.541 226.647 469.964C203.46 425.613 199.855 371.414 201 349.5C213.4 271.1 262.5 248.5 285.5 247C308.5 248.667 360.4 251 384 247C402.958 243.787 411.57 235.626 414.656 229.776C415.753 227.696 414.41 225.386 412.218 224.533C352.209 201.196 322.815 186.869 313.721 181.552C312.597 180.895 311.851 179.81 311.531 178.548C303.241 145.772 267.446 87.1691 185.5 100.5C101.9 114.1 75.3333 174.167 72.5 202.5V467.5C72.5 470.261 70.2614 472.5 67.5 472.5H5.5C2.73858 472.5 0.5 470.261 0.5 467.5Z" fill="currentColor" stroke="currentColor"/>
</svg>
<span>Deduckly</span></div><nav aria-label="Main navigation"><a href="#contact">Contact</a><a href="/deduckly/privacy">Privacy</a></nav></header>
<main>
<section class="hero"><p class="eyebrow">Deduckly Support</p><h1>Let’s get you<br>back to your day.</h1><p class="lead">A question about your account, a trip that needs a second look, or something that isn’t working? We’re here to help you move forward.</p></section>
<div class="grid">
<section class="card" id="contact"><h2>Talk to our team</h2><p>Tell us what’s happening and we’ll help you find the next step.</p><a class="button" href="mailto:deducklysupport@karlsonworks.com?subject=Deduckly%20support">Email Deduckly Support <span aria-hidden="true">↗</span></a><a class="email" href="mailto:deducklysupport@karlsonworks.com">deducklysupport@karlsonworks.com</a></section>
<section class="card"><h2>A few details help</h2><p>Give us a little context so we can understand the issue.</p><ul><li>The email address on your Deduckly account</li><li>Your device model and operating system version</li><li>What happened and what you expected</li><li>A screenshot, if it helps explain the issue</li></ul></section>
</div>
<section class="help" aria-labelledby="help-title"><h2 id="help-title">A good place to start</h2><p>Quick guidance for a few common questions.</p>
<details><summary>I’m having trouble signing in</summary><p>If you registered with email, open the verification link in your inbox before signing in. You can request another verification email from the app. If you joined with Google, choose “Continue with Google.” For a forgotten password, select “Forgot password?” on the sign-in screen.</p></details>
<details><summary>How do I enable location or notifications?</summary><p>Open your device settings, find Deduckly, and review its location and notification permissions. You can manage notification preferences in Deduckly’s Settings. Location access does not, by itself, start a trip.</p></details>
<details><summary>I have a question about my records</summary><p>Email our support team with the date of the trip, income entry, or expense you need help with, and describe what looks wrong. Include a screenshot if it helps show the issue.</p></details>
<details><summary>How do I contact you about my account or data?</summary><p>Email <a href="mailto:deducklysupport@karlsonworks.com">deducklysupport@karlsonworks.com</a> with your request. You can also read our <a href="/deduckly/privacy">privacy policy</a> for information about how Deduckly handles your data.</p></details>
</section>
</main>
<footer><span>Deduckly · Your miles, money, and work.</span><a href="/deduckly/privacy">Privacy policy</a></footer>
</div>
</body>
</html>
"""
