import { LandingJourney } from "@/components/LandingJourney";
import { LandingPostalForm } from "@/components/LandingPostalForm";

export default function HomePage() {
  return (
    <main className="landing">
      <section className="hero">
        <div className="hero__media" aria-hidden />
        <div className="hero__content">
          <h1 className="hero__brand">RecipeGain</h1>
          <p className="hero__headline">
            Save on this week’s flyer. Eat well without the planning stress.
          </p>
          <p className="hero__sub">
            Local promotions become meals and a phone-ready shopping list —
            matched to how you want to eat.
          </p>
          <LandingPostalForm id="start" variant="hero" />
          <p className="hero__continue">
            <a href="#priorities">Or shape your week first ↓</a>
          </p>
        </div>
      </section>

      <LandingJourney />
    </main>
  );
}
