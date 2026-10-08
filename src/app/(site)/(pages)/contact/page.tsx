import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Atelier Concierge & Contact | The Handmade Vendor",
  description: "Connect with The Handmade Vendor atelier concierge for bespoke commissions, artisan inquiries, and private consultations.",
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
