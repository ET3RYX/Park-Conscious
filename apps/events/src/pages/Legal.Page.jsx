import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import DefaultlayoutHoc from "../layout/Default.layout";
import { Shield, FileText, RefreshCcw, Truck, ChevronRight } from 'lucide-react';

const legalContent = {
  terms: {
    title: "Terms & Conditions",
    icon: <FileText size={20} />,
    content: (
      <div className="space-y-8">
        <div className="flex flex-col gap-2 mb-12">
          <p className="text-2xl font-black text-white uppercase tracking-tight">Backstage</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Effective Date: April 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>powered by Park Conscious</span>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-6 py-2 bg-indigo-500/5 rounded-r-xl">
          These Terms and Conditions ("Terms") govern your use of the Backstage platform ("Platform"), operated at events.parkconscious.in. By accessing or using Backstage, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
        </p>

        {[
          {
            id: 1,
            title: "About Backstage",
            content: "Backstage is a technology platform that enables event organisers to list events and allows users to discover, book tickets for, and access events across Delhi NCR. Backstage also facilitates pre-booked parking for events through its partnership with Park Conscious. Backstage is a marketplace platform — it is not itself an event organiser and does not own, operate, manage, or conduct any events listed on the Platform.",
            footer: "Backstage is a platform. We connect users and organisers. We are not responsible for the quality, safety, legality, or conduct of any event listed on our platform."
          },
          {
            id: 2,
            title: "User Accounts",
            items: [
              "You must be at least 18 years old to create an account",
              "You are responsible for maintaining the confidentiality of your login credentials",
              "You must provide accurate and complete information when registering",
              "You must notify us immediately of any unauthorised use of your account",
              "We reserve the right to suspend or terminate accounts that violate these Terms"
            ]
          },
          {
            id: 3,
            title: "Event Listings & Organiser Responsibility",
            desc: "Event organisers who list events on Backstage agree that:",
            items: [
              "All information provided in the event listing is accurate and complete",
              "They hold all necessary permissions, licenses, and approvals to conduct the event",
              "They are solely responsible for the conduct, safety, and quality of their event",
              "They are responsible for fulfilling commitments made to attendees",
              "Backstage reserves the right to remove any event listing that violates our policies or applicable laws"
            ],
            footer: "Backstage is not liable for any loss, damage, injury, or dissatisfaction arising from an event listed on the Platform. Any disputes between users and organisers must be resolved between the parties involved."
          },
          {
            id: 4,
            title: "Ticket Purchases & Payments",
            desc: "When you purchase a ticket on Backstage:",
            items: [
              "All payments are processed securely through Razorpay or any other payment gateway",
              "Backstage does not hold your payment — funds are handled entirely through Razorpay's or any other payment gateway’s payment infrastructure as per their standard settlement timelines (T+2 from transaction date)",
              "Backstage charges a platform fee (flat percentage) on paid tickets as disclosed at checkout",
              "Your purchase is a direct transaction between you and the event organiser — Backstage facilitates this transaction but is not a party to it"
            ]
          },
          {
            id: 5,
            title: "Prohibited Conduct",
            desc: "You agree not to:",
            items: [
              "Use the platform for any unlawful purpose",
              "Resell or transfer tickets in violation of event organiser restrictions",
              "Submit false, misleading, or fraudulent information",
              "Attempt to circumvent our security systems or access other users' accounts",
              "Scrape, copy, or reproduce Platform content without written permission",
              "Use automated tools (bots) to purchase tickets"
            ]
          },
          {
            id: 6,
            title: "Intellectual Property",
            content: "All content on Backstage — including but not limited to logos, text, graphics, and software — is the property of Backstage or its licensors. You may not reproduce, distribute, or use this content without explicit written permission."
          },
          {
            id: 7,
            title: "Limitation of Liability",
            content: "To the maximum extent permitted by law, Backstage shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to event cancellations, quality disputes, or payment issues between users and organisers. Our total liability in any matter shall not exceed the amount you paid to Backstage in platform fees for the relevant transaction."
          },
          {
            id: 8,
            title: "Governing Law",
            content: "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi, India."
          },
          {
            id: 9,
            title: "Changes to Terms",
            content: "We may update these Terms from time to time. We will notify you of material changes via email or platform notice. Continued use of the Platform after such changes constitutes acceptance."
          },
          {
            id: 10,
            title: "Contact",
            content: "For any questions about these Terms, contact: help@parkconscious.in"
          }
        ].map((section) => (
          <section key={section.id} className="pt-8 border-t border-white/5">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
              <span className="text-indigo-500">{section.id}.</span> {section.title}
            </h4>
            {section.desc && <p className="text-slate-400 mb-6">{section.desc}</p>}
            {section.items && (
              <ul className="space-y-4 mb-6">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 group-hover:scale-125 transition-transform"></div>
                    <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{item}</p>
                  </li>
                ))}
              </ul>
            )}
            {section.content && <p className="text-slate-400 leading-relaxed">{section.content}</p>}
            {section.footer && (
              <p className="mt-6 p-4 bg-indigo-500/10 rounded-2xl text-xs font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                {section.footer}
              </p>
            )}
          </section>
        ))}
      </div>
    )
  },
  privacy: {
    title: "Privacy Policy",
    icon: <Shield size={20} />,
    content: (
      <div className="space-y-8">
        <div className="flex flex-col gap-2 mb-12">
          <p className="text-2xl font-black text-white uppercase tracking-tight">Backstage</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Effective Date: April 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>powered by Park Conscious</span>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-6 py-2 bg-indigo-500/5 rounded-r-xl">
          This Privacy Policy explains how Backstage ("we", "our", "us", or "the Platform") collects, uses, stores, and protects your personal information when you use our platform at backstage.events, including our mobile applications and related services. By using Backstage, you agree to the practices described in this policy.
        </p>

        <p className="text-slate-300 leading-relaxed">
          Your trust matters to us. We do not exploit, sell, or misuse your personal data ever. Data we collect is used solely to operate and improve the Backstage platform.
        </p>
        
        {[
          {
            id: 1,
            title: "Information We Collect",
            desc: "We collect the following information to provide you our services:",
            items: [
              "Identity information: name, date of birth, profile photo",
              "Contact information: email address, phone number",
              "Account credentials: username and encrypted password",
              "Payment information: processed securely via Razorpay or any other payment gateway, we do not store card numbers or banking credentials on our servers",
              "Device and usage data: IP address, browser type, operating system, pages visited, and time spent on the platform",
              "Location data: approximate location to show relevant events near you (only with your permission)",
              "Event interaction data: events browsed, tickets purchased, parking slots booked"
            ]
          },
          {
            id: 2,
            title: "How We Use Your Information",
            desc: "We use your data only for the following purposes:",
            items: [
              "To create and manage your account on Backstage",
              "To process event bookings, ticket purchases, and parking reservations",
              "To send booking confirmations, QR passes, and event reminders",
              "To display events relevant to your location and interests",
              "To resolve disputes and respond to customer support requests",
              "To improve platform features and fix technical issues",
              "To comply with applicable laws and legal obligations"
            ],
            footer: "We do NOT sell your personal data to third parties. We do NOT use your data for unsolicited advertising outside the Backstage platform. We do NOT profile you for commercial exploitation."
          },
          {
            id: 3,
            title: "Sharing of Data",
            desc: "We may share your information in the following limited circumstances:",
            items: [
              "With event organisers: your name and contact information may be shared with the organiser of an event you register for, solely to facilitate your attendance",
              "With payment processors: Razorpay or any other payment gateway handles all payment transactions. Their privacy policy governs how they handle your payment data",
              "With technology service providers: hosting, analytics, and communication services that help us operate the platform, under strict data confidentiality agreements",
              "With legal authorities: when required by law, court order, or government regulation"
            ],
            footer: "We do not share your data with advertisers, data brokers, or any party for commercial gain."
          },
          {
            id: 4,
            title: "Data Retention",
            content: "We retain your personal data for as long as your account is active or as required to provide services and comply with legal obligations. You may request deletion of your account and associated data by contacting us at help@parkconscious.in Certain data may be retained for up to 3 years for legal, tax, and dispute resolution purposes."
          },
          {
            id: 5,
            title: "Security",
            content: "We implement industry-standard technical and organisational measures to protect your data, including encrypted data transmission (HTTPS/TLS), secure cloud infrastructure, and access controls. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but are committed to protecting your information to the best of our ability."
          },
          {
            id: 6,
            title: "Your Rights",
            desc: "You have the right to:",
            items: [
              "Access the personal data we hold about you",
              "Correct inaccurate data in your account",
              "Request deletion of your account and data",
              "Withdraw consent for marketing communications at any time",
              "Lodge a complaint with the relevant data protection authority"
            ],
            footer: "To exercise any of these rights, contact us at help@parkconscious.in."
          },
          {
            id: 7,
            title: "Cookies",
            content: "We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how users navigate the platform. You can disable cookies in your browser settings, but some features may not work correctly without them."
          },
          {
            id: 8,
            title: "Third-Party Links",
            content: "Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of those sites and encourage you to review their policies separately."
          },
          {
            id: 9,
            title: "Changes to This Policy",
            content: "We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Continued use of Backstage after changes constitutes your acceptance of the updated policy."
          },
          {
            id: 10,
            title: "Contact",
            content: "For any privacy-related questions or concerns, contact us at: help@parkconscious.in"
          }
        ].map((section) => (
          <section key={section.id} className="pt-8 border-t border-white/5">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
              <span className="text-indigo-500">{section.id}.</span> {section.title}
            </h4>
            {section.desc && <p className="text-slate-400 mb-6">{section.desc}</p>}
            {section.items && (
              <ul className="space-y-4 mb-6">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 group-hover:scale-125 transition-transform"></div>
                    <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{item}</p>
                  </li>
                ))}
              </ul>
            )}
            {section.content && <p className="text-slate-400 leading-relaxed">{section.content}</p>}
            {section.footer && (
              <p className="mt-6 p-4 bg-indigo-500/10 rounded-2xl text-xs font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                {section.footer}
              </p>
            )}
          </section>
        ))}
      </div>
    )
  },
  refunds: {
    title: "Refunds & Cancellation",
    icon: <RefreshCcw size={20} />,
    content: (
      <div className="space-y-8">
        <div className="flex flex-col gap-2 mb-12">
          <p className="text-2xl font-black text-white uppercase tracking-tight">Backstage</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Effective Date: April 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>powered by Park Conscious</span>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed italic border-l-2 border-amber-500 pl-6 py-2 bg-amber-500/5 rounded-r-xl">
          <strong className="text-amber-500 uppercase tracking-widest text-[10px] block mb-2">Important Notice</strong>
          Backstage is a marketplace platform. We facilitate ticket sales between event organisers and attendees. Refund eligibility for any event is determined entirely by the event organiser — not by Backstage.
        </p>

        {[
          {
            id: 1,
            title: "Backstage's Role in Refunds",
            desc: "Backstage is a technology platform and does not itself host, organise, or manage events. When you purchase a ticket on Backstage, your contract for the event is with the organiser, not with Backstage. Accordingly:",
            items: [
              "Backstage does not independently decide whether a refund is granted for any event",
              "Refunds are issued only if and when the event organiser explicitly authorises them",
              "If the organiser does not approve a refund, Backstage cannot and will not override that decision",
              "Backstage's platform fee charged at the time of purchase is non-refundable once a ticket is issued, regardless of the outcome of a refund request to the organiser"
            ]
          },
          {
            id: 2,
            title: "Event Cancellation by Organiser",
            desc: "If an organiser cancels an event:",
            items: [
              "The organiser is solely responsible for notifying attendees and initiating refunds",
              "Backstage will facilitate the refund process through Razorpay or any other payment gateway on the organiser's instruction",
              "Refunds, if approved by the organiser, will be credited to the original payment method within 5–7 business days of Razorpay or any other payment gateways processing",
              "Backstage's platform fee is non-refundable even in the case of organiser-initiated cancellation"
            ],
            footer: "Backstage is not financially liable for any losses suffered due to event cancellation by an organiser. We are not the organiser and do not control organiser decisions."
          },
          {
            id: 3,
            title: "Event Cancellation by User (User-Initiated)",
            desc: "If you wish to cancel your ticket:",
            items: [
              "Contact the event organiser directly through the Platform or their provided contact details",
              "Whether a refund is granted depends entirely on the organiser's stated cancellation policy for that event",
              "Some organisers may offer partial refunds, full refunds, or no refunds depending on how far in advance you cancel",
              "Backstage is not a party to this decision"
            ]
          },
          {
            id: 4,
            title: "Event Postponement or Rescheduling",
            desc: "If an event is postponed or rescheduled by the organiser:",
            items: [
              "Your ticket is typically valid for the new date, at the organiser's discretion",
              "Refund eligibility in case of postponement is determined by the organiser",
              "Backstage will communicate any changes notified to us by the organiser"
            ]
          },
          {
            id: 5,
            title: "Payment Settlement",
            desc: "All payments on Backstage are processed through Razorpay or any other authorised payment gateway, a regulated payment gateway. Backstage does not hold or escrow your funds:",
            items: [
              "Settlement to organisers follows Razorpay's or any other payment gateway’s standard T+2 settlement cycle from the date of transaction",
              "Backstage initiates payouts to organisers in accordance with Razorpay’s or any other payment gateway’s guideline settlement timelines — we do not delay or withhold funds beyond what the payment gateway cycle requires",
              "In the event of a refund, the amount is reversed through Razorpay or any other payment gateway to your original payment method"
            ]
          },
          {
            id: 6,
            title: "Parking Bookings",
            desc: "Pre-booked parking slots associated with an event are subject to the following:",
            items: [
              "Parking bookings are managed by Park Conscious, Backstage's parking partner",
              "If an event is cancelled, parking refunds are processed separately and are subject to Park Conscious's cancellation policy",
              "Unused parking slots are non-refundable unless the associated event is cancelled by the organiser"
            ]
          },
          {
            id: 7,
            title: "How to Request a Refund",
            desc: "To initiate a refund request:",
            items: [
              "Step 1: Contact the event organiser through the event page on Backstage",
              "Step 2: If the organiser approves the refund, they will instruct Backstage to process it",
              "Step 3: Backstage will initiate the refund via Razorpay or any payment gateway typically processed within 5–7 business days",
              "Step 4: If you are unable to reach the organiser, contact us at help@parkconscious.in or report in support section. We will facilitate communication but cannot compel the organiser to issue a refund"
            ]
          },
          {
            id: 8,
            title: "Contact",
            content: "For refund-related queries: help@parkconscious.in or visit our contact section."
          }
        ].map((section) => (
          <section key={section.id} className="pt-8 border-t border-white/5">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
              <span className="text-indigo-500">{section.id}.</span> {section.title}
            </h4>
            {section.desc && <p className="text-slate-400 mb-6">{section.desc}</p>}
            {section.items && (
              <ul className="space-y-4 mb-6">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 group-hover:scale-125 transition-transform"></div>
                    <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{item}</p>
                  </li>
                ))}
              </ul>
            )}
            {section.content && <p className="text-slate-400 leading-relaxed">{section.content}</p>}
            {section.footer && (
              <p className="mt-6 p-4 bg-indigo-500/10 rounded-2xl text-xs font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                {section.footer}
              </p>
            )}
          </section>
        ))}
      </div>
    )
  },
  shipping: {
    title: "Delivery & Pass Policy",
    icon: <Truck size={20} />,
    content: (
      <div className="space-y-8">
        <div className="flex flex-col gap-2 mb-12">
          <p className="text-2xl font-black text-white uppercase tracking-tight">Backstage</p>
          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Effective Date: April 2026</span>
            <span className="w-1 h-1 rounded-full bg-slate-700"></span>
            <span>powered by Park Conscious</span>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed italic border-l-2 border-indigo-500 pl-6 py-2 bg-indigo-500/5 rounded-r-xl">
          Backstage is a digital platform. We do not ship physical goods. All event passes, tickets, and booking confirmations are delivered digitally.
        </p>

        {[
          {
            id: 1,
            title: "Digital Pass Delivery",
            desc: "Upon successful payment for any event or parking booking on Backstage:",
            items: [
              "A QR-coded digital pass is generated and sent to your registered email address immediately",
              "Your pass is also available in your Backstage account under 'My Bookings' at all times",
              "A push notification and WhatsApp confirmation (where applicable) will be sent to your registered phone number",
              "All passes are delivered within minutes of payment confirmation — if you do not receive your pass within 30 minutes, contact us at help@parkconscious.in"
            ]
          },
          {
            id: 2,
            title: "Event Reminders",
            desc: "Backstage automatically sends:",
            items: [
              "A booking confirmation immediately after purchase",
              "An event reminder 24 hours before the event with your QR pass attached",
              "A day-of reminder on the morning of the event with venue and parking directions"
            ]
          },
          {
            id: 3,
            title: "Pass Validity",
            items: [
              "Each QR pass is valid for a single entry to the event it was issued for",
              "Passes are non-transferable unless the event organiser explicitly permits transfers",
              "Duplicate or tampered passes will be rejected at the venue",
              "Backstage is not responsible for passes that are shared, screenshotted, or duplicated by the user"
            ]
          },
          {
            id: 4,
            title: "Lost or Undelivered Passes",
            content: "If you do not receive your pass, log into your account at backstage.events, go to 'My Bookings', and download your pass directly. If you face technical issues, contact us at help@parkconscious.in with your booking ID."
          },
          {
            id: 5,
            title: "Contact",
            content: "For any pass or delivery issues: help@parkconscious.in or visit our Contact Us section."
          }
        ].map((section) => (
          <section key={section.id} className="pt-8 border-t border-white/5">
            <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4 flex items-center gap-4">
              <span className="text-indigo-500">{section.id}.</span> {section.title}
            </h4>
            {section.desc && <p className="text-slate-400 mb-6">{section.desc}</p>}
            {section.items && (
              <ul className="space-y-4 mb-6">
                {section.items.map((item, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 group-hover:scale-125 transition-transform"></div>
                    <p className="text-slate-400 group-hover:text-slate-200 transition-colors">{item}</p>
                  </li>
                ))}
              </ul>
            )}
            {section.content && <p className="text-slate-400 leading-relaxed">{section.content}</p>}
            {section.footer && (
              <p className="mt-6 p-4 bg-indigo-500/10 rounded-2xl text-xs font-bold text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                {section.footer}
              </p>
            )}
          </section>
        ))}
      </div>
    )
  }
};

const LegalPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Ensure the tab from URL is valid, otherwise default to terms
  const initialTab = legalContent[tabParam] ? tabParam : 'terms';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (tabParam && legalContent[tabParam]) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  return (
    <div className="bg-[#050507] min-h-screen text-white pb-24 w-full selection:bg-indigo-500/30">
      <Helmet>
        <title>{legalContent[activeTab].title.toUpperCase()} | BACKSTAGE</title>
        <meta name="description" content={`Legal information regarding ${legalContent[activeTab].title} at BACKSTAGE.`} />
      </Helmet>

      {/* Hero Section */}
      <div className="w-full relative py-32 md:py-48 flex flex-col items-center overflow-hidden isolation-isolate">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute bottom-[0%] right-[-5%] w-[40%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex flex-col items-center">
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] font-black uppercase tracking-tight leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
              LEGAL
            </h1>
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] font-black uppercase tracking-tight leading-[0.85] md:leading-[0.75] m-0 p-0 text-transparent bg-clip-text bg-gradient-to-b from-indigo-400 to-indigo-800/20 select-none pb-4 -mt-1 sm:-mt-2 md:-mt-4">
              CENTRE.
            </h1>
          </div>

          <div className="mt-8 md:mt-12 max-w-xl mx-auto">
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed uppercase tracking-[0.4em] text-[10px] md:text-[12px]">
              TRUST • TRANSPARENCY • COMPLIANCE
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10 -mt-10 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-32 space-y-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-4 mb-6">Documentation</p>
              <nav className="flex flex-col gap-2">
                {Object.keys(legalContent).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex items-center justify-between w-full px-6 py-5 rounded-2xl transition-all duration-300 group ${
                      activeTab === tab 
                        ? 'bg-white text-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] scale-[1.02]' 
                        : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`${activeTab === tab ? 'text-indigo-600' : 'text-slate-600 group-hover:text-indigo-400'} transition-colors`}>
                        {legalContent[tab].icon}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">{legalContent[tab].title}</span>
                    </div>
                    {activeTab === tab && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                  </button>
                ))}
              </nav>

              <div className="mt-12 p-8 card-glass rounded-[2rem] border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Need help?</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">If you have any questions regarding our policies, please reach out.</p>
                <a href="/support" className="inline-flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest hover:text-indigo-400 transition-colors">
                  Contact Support <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 min-w-0">
            <div className="card-glass p-10 md:p-16 rounded-[3rem] border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  {legalContent[activeTab].icon}
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{legalContent[activeTab].title}</h2>
              </div>
              
              <div className="prose prose-invert max-w-none">
                {legalContent[activeTab].content}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default DefaultlayoutHoc(LegalPage);
