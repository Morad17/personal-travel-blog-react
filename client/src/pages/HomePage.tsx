import Hero from '../components/home/Hero';
import StatsBar from '../components/home/StatsBar';
import FeaturedPlaces from '../components/home/FeaturedPlaces';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <StatsBar />
      <FeaturedPlaces />
    </main>
  );
}
