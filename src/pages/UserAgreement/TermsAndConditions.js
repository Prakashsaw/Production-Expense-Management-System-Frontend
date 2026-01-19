import React, { useState, useEffect } from "react";
import Header1 from "../../components/Layout/Header1";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  return (
    <>
      {isLoggedIn ? <Header /> : <Header1 />}
      <div className="auth-page-wrapper">
        <div className="legal-content">
          <div className="legal-container">
            <div className="legal-document">
              <h1 className="legal-title">Terms and Conditions</h1>
              <p className="legal-last-updated">Last Updated: January 2026</p>
              <p className="legal-text" style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                These Terms and Conditions have been updated to reflect new features including custom categories, 
                budget management, and automated bill reminders.
              </p>

              <section className="legal-section">
                <h2 className="legal-heading">1. Acceptance of Terms</h2>
                <p className="legal-text">
                  By accessing and using the Expense Management System ("the Service"), 
                  you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">2. Description of Service</h2>
                <p className="legal-text">
                  The Expense Management System is a web-based financial management application 
                  that allows users to:
                </p>
                <ul className="legal-list">
                  <li>Track and manage income and expense transactions</li>
                  <li>Create and manage custom expense and income categories for personalized organization</li>
                  <li>Set and manage budgets for categories with flexible periods (Monthly, Yearly, Weekly, or Custom)</li>
                  <li>Receive budget alerts when approaching spending limits</li>
                  <li>Create and manage bill reminders with automated email notifications</li>
                  <li>Set up recurring bills with automatic reminder scheduling</li>
                  <li>Track bill payment status and history</li>
                  <li>View analytics and insights through charts and graphs</li>
                  <li>Filter transactions by date range, type, and category</li>
                  <li>Export transaction data to Excel format</li>
                  <li>Manage user profile and account settings</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">3. User Account and Registration</h2>
                <p className="legal-text">
                  To use the Service, you must:
                </p>
                <ul className="legal-list">
                  <li>Create an account by providing accurate, current, and complete information</li>
                  <li>Verify your email address through the verification link sent to your email</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and identification</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">4. User Responsibilities</h2>
                <p className="legal-text">
                  You agree to:
                </p>
                <ul className="legal-list">
                  <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                  <li>Provide accurate and truthful information when creating transactions, budgets, categories, and bill reminders</li>
                  <li>Maintain accurate budget amounts and bill due dates</li>
                  <li>Verify that automated bill reminders are correctly configured and received</li>
                  <li>Take responsibility for any missed payments or financial consequences resulting from incorrect bill reminder settings</li>
                  <li>Not attempt to gain unauthorized access to the Service or other users' accounts</li>
                  <li>Not use the Service to transmit any malicious code or harmful content</li>
                  <li>Not interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Not use automated systems or bots to access the Service without permission</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">5. Financial Data and Accuracy</h2>
                <p className="legal-text">
                  While we strive to provide accurate financial tracking tools, you acknowledge that:
                </p>
                <ul className="legal-list">
                  <li>You are solely responsible for the accuracy of all financial data you enter, including transactions, budgets, categories, and bill reminders</li>
                  <li>Budget calculations and alerts are based on the data you provide and may not reflect actual spending patterns if transactions are not recorded accurately</li>
                  <li>Bill reminders are automated notifications based on the information you provide; you are responsible for verifying due dates and payment amounts</li>
                  <li>The Service is a tool for tracking and does not provide financial advice</li>
                  <li>We are not responsible for any financial decisions made based on the data in the Service</li>
                  <li>We are not liable for missed bill payments, late fees, or other financial consequences resulting from incorrect bill reminder settings or system failures</li>
                  <li>You should verify important financial information independently</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">6. Data Export and Backup</h2>
                <p className="legal-text">
                  The Service provides functionality to export your transaction data to Excel format. 
                  You are responsible for:
                </p>
                <ul className="legal-list">
                  <li>Regularly backing up your data using the export feature</li>
                  <li>Maintaining copies of your exported data, including transactions, budgets, categories, and bill reminders</li>
                  <li>Understanding that data loss may occur if you fail to maintain backups</li>
                  <li>Note that custom categories, budgets, and bill reminders are part of your account data and should be documented separately if needed</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">7. Account Termination</h2>
                <p className="legal-text">
                  We reserve the right to:
                </p>
                <ul className="legal-list">
                  <li>Suspend or terminate your account if you violate these Terms</li>
                  <li>Delete your account and data after a period of inactivity</li>
                  <li>Refuse service to anyone for any reason at any time</li>
                </ul>
                <p className="legal-text">
                  You may terminate your account at any time by contacting us or deleting your account 
                  through the Service settings.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">8. Intellectual Property</h2>
                <p className="legal-text">
                  The Service and its original content, features, and functionality are owned by 
                  Prakash & Company Pvt Ltd and are protected by international copyright, trademark, 
                  patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">9. Limitation of Liability</h2>
                <p className="legal-text">
                  In no event shall Prakash & Company Pvt Ltd, its directors, employees, or agents 
                  be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible 
                  losses, resulting from your use of the Service.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">10. Service Availability and Automated Features</h2>
                <p className="legal-text">
                  We do not guarantee that the Service will be available at all times. The Service 
                  may be unavailable due to maintenance, updates, or circumstances beyond our control. 
                  We are not liable for any loss or damage resulting from Service unavailability.
                </p>
                <p className="legal-text">
                  Regarding automated features:
                </p>
                <ul className="legal-list">
                  <li>Bill reminder emails are sent automatically based on your settings, but delivery is not guaranteed due to email service limitations</li>
                  <li>Budget alerts are generated based on your transaction data and may not be real-time</li>
                  <li>You should not rely solely on automated reminders and should maintain your own records of important bills and due dates</li>
                  <li>We are not responsible for missed notifications due to email delivery failures, spam filters, or incorrect email addresses</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">11. Changes to Terms</h2>
                <p className="legal-text">
                  We reserve the right to modify these Terms at any time. We will notify users of 
                  any material changes by posting the new Terms on this page and updating the 
                  "Last Updated" date. Your continued use of the Service after such changes 
                  constitutes acceptance of the new Terms.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">12. Contact Information</h2>
                <p className="legal-text">
                  If you have any questions about these Terms and Conditions, please contact us at:
                </p>
                <ul className="legal-list">
                  <li>Email: prakash8873saw@gmail.com</li>
                  <li>Email: info.prakash.company@gmail.com</li>
                  <li>Phone: +91 8873323323</li>
                  <li>Address: Prakash & Company Pvt. Ltd, BCIT Park, Bangalore, Karnataka, India 560064</li>
                </ul>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">13. Governing Law</h2>
                <p className="legal-text">
                  These Terms shall be governed by and construed in accordance with the laws of India, 
                  without regard to its conflict of law provisions. Any disputes arising from these 
                  Terms or the Service shall be subject to the exclusive jurisdiction of the courts 
                  in Bangalore, Karnataka, India.
                </p>
              </section>

              <section className="legal-section">
                <h2 className="legal-heading">14. Entire Agreement</h2>
                <p className="legal-text">
                  These Terms constitute the entire agreement between you and Prakash & Company Pvt Ltd 
                  regarding the use of the Expense Management System and supersede all prior agreements 
                  and understandings.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsAndConditions;
