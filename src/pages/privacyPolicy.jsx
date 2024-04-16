import React from "react";

const PrivacyPolicy = () => {
  return (
    <>
      <div className="min-h-screen mx-auto flex flex-col items-center justify-center relative p-4 sm:p-8 b-image">
        <div
          className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6"
          //   className="slick-list"
          //   style={{
          //     width: 800,
          //     background: "#fff",
          //     margin: "auto",
          //     position: "absolute",
          //     left: "50%",
          //     transform: "translate(-50%, -50%)",
          //     top: "50%",
          //     border: "1px #ddd solid",
          //     padding: "40px",
          //     borderRadius: "10px",
          //     fontFamily: "SF Compact", // Adding SF Compact font family
          //   }}
        >
          <h2 style={{ textAlign: "center", fontSize: 24, margin: 20 }}>
            Privacy Policy
          </h2>
          This Privacy Policy describes how Assemble, a San Diego-based events
          app, collects, uses, and protects the personal information you provide
          when using our services.
          <p style={{ lineHeight: 2, paddingLeft: "20px" }}>
            1. Information Collected
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              Location Data: We collect your location data to provide you with
              localized event recommendations and updates relevant to your area.
            </span>
            2. Purpose of Data Collection
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              We collect the aforementioned information for the following
              purposes:
            </span>
            3. Data Storage and Security
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              We prioritize the security of your personal information. We
              utilize social login exclusively, ensuring that your data remains
              protected through the authentication protocols provided by the
              respective social media platforms.
            </span>
            4. Third-Party Services
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              We do not utilize any third-party services or plugins that collect
              user data.
            </span>
            5. User Rights
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              You have the right to access, update, or delete your personal
              data. To delete your profile and associated information, simply
              navigate to the settings section within the app and select the
              option to delete your profile.
            </span>
          </p>
          <p style={{ paddingLeft: "20px" }}>
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              Contact Us
            </span>
            If you have any questions or concerns regarding our privacy
            practices, please contact us at hello@assemble.social.
          </p>
          <p style={{ paddingLeft: "20px" }}>
            <span
              style={{
                display: "list-item",
                listStyleType: "disc",
              }}
            >
              Changes to This Privacy Policy
            </span>
            We reserve the right to update or modify this Privacy Policy at any
            time. Any changes will be effective immediately upon posting the
            updated Privacy Policy on our app. By continuing to use our services
            after any changes to this Privacy Policy, you acknowledge and agree
            to the updated terms.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
