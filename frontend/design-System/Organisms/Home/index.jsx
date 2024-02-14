import Hero from '../../Molecules/Banner/Hero';
import GuidelineCards from '../../Molecules/GuidelineCards';
import InfoCards from '../InfoCards';
export default function Home() {
  return (
    <div className="px-5">
      <Hero />
      <InfoCards />
      <GuidelineCards />
    </div>
  );
}
