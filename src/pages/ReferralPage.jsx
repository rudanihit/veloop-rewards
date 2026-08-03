import styles from './ReferralPage.module.css';
import Header from '../components/Header/Header';
import Hero from '../components/Hero/Hero';
import ReferralCard from '../components/ReferralCard/ReferralCard';
import ShareButtons from '../components/ShareButtons/ShareButtons';
import StatsSection from '../components/StatsSection/StatsSection';
import FloatingOrbs from '../components/common/FloatingOrbs';
import ReferralProgress from '../components/ReferralProgress/ReferralProgress';
import RewardsSection from '../components/RewardsSection/RewardsSection';
// import RewardTimeline from '../components/RewardTimeline/RewardTimeline';
import ReferralRules from '../components/ReferralRules/ReferralRules';
import FAQ from '../components/FAQ/FAQ';

function ReferralPage() {
  return (
    <div className={styles.page}>
      <Header />

      {/* ---------- DARK ZONE ---------- */}
      <section className={styles.darkZone}>
        <div className={styles.meshOverlay} aria-hidden="true" />
        <FloatingOrbs />
        <div className="container">
          <Hero />
          <ReferralCard />
          <ShareButtons />
        </div>
      </section>

      {/* ---------- LOWER ZONE ---------- */}
      <section className={styles.lightZone}>
        <FloatingOrbs />
        <div className="container">
          <StatsSection />

          {/* Module 6: Referral Progress */}
          <ReferralProgress />

          {/* Module 7: Rewards Section */}
          <RewardsSection />
          
          {/* Module 8: Reward Timeline */}
          {/* <RewardTimeline /> */}

          {/* Module 9: Referral Rules */}
          <ReferralRules /> 

          {/* Module 10: FAQ */}
          <FAQ /> 
        </div>
      </section>
    </div>
  );
}

export default ReferralPage;