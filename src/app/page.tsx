import Nav from "@/components/Nav";
import Hero from "@/components/sections/Hero";
import Demo from "@/components/sections/Demo";
import FeatureSequence from "@/components/sections/FeatureSequence";
import Waitlist from "@/components/sections/Waitlist";
import Footer from "@/components/sections/Footer";

/**
 * The whole page.
 *
 * Band order is locked: Nav, Hero, Demo, Creative Design, Intelligent
 * Automation, Secure Sharing, Clean Data, Waitlist, Footer.
 *
 * The four feature bands are not four sections here, they are one sequence —
 * `FeatureSequence` owns the org boundary that frames all four, and renders
 * them from `config.bands` through the single `FeatureBand` component. That
 * grouping is the difference between a story and a catalogue.
 */
export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Demo />
        <FeatureSequence />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
