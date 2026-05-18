import HeroSection from "@/components/HeroSection";
import Services from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import ContactForm from "@/components/ContactForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <Services />
      <Portfolio />
      <ContactForm />
    </main>
  );
}
