import { ContactForm } from "@/components/ContactForm"
import { ContactInfo } from "@/components/ContactInfo"
import { FaqSection } from "@/components/FaqSection"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <ContactForm />
        <ContactInfo />
      </div>

      <div className="mt-12">
        <FaqSection />
      </div>
    </div>
  )
}
