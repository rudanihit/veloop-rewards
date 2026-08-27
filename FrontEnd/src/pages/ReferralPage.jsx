import { useEffect, useState } from "react";
import styles from "./ReferralPage.module.css";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import ReferralCard from "../components/ReferralCard/ReferralCard";
import ShareButtons from "../components/ShareButtons/ShareButtons";
import StatsSection from "../components/StatsSection/StatsSection";
import ReferralProgress from "../components/ReferralProgress/ReferralProgress";
import RewardsSection from "../components/RewardsSection/RewardsSection";
import RewardTimeline from "../components/RewardTimeline/RewardTimeline";
import ReferralRules from "../components/ReferralRules/ReferralRules";
import FAQ from "../components/FAQ/FAQ";
import Footer from "../components/Footer/Footer";

import {
  getReferralDashboard,
  getRewardMilestones,
} from "../services/api";

function ReferralPage() {
  const [dashboard, setDashboard] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // Load real referral dashboard
        const [dashboardResponse, milestonesResponse] = await Promise.all([
          getReferralDashboard(),
          getRewardMilestones(),
        ]);

        setDashboard(dashboardResponse?.data || null);
        setMilestones(milestonesResponse?.data || []);
      } catch (err) {
        console.error("Failed to load referral dashboard:", err);

        setError(err?.message || "Failed to load referral dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p>Loading referral dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className="container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />

      {/* ---------- DARK ZONE ---------- */}
      <section className={styles.darkZone}>
        <div className={styles.meshOverlay} aria-hidden="true" />

        <div className="container">
          <Hero />

          <ReferralCard dashboard={dashboard} />

          <ShareButtons dashboard={dashboard} />
        </div>
      </section>

      {/* ---------- LOWER ZONE ---------- */}
      <section className={styles.lightZone}>
        <div className="container">
          <StatsSection dashboard={dashboard} />
          <ReferralProgress dashboard={dashboard} milestones={milestones} />

          <RewardsSection dashboard={dashboard} milestones={milestones} />

          <RewardTimeline dashboard={dashboard} milestones={milestones} />
          <ReferralRules />
          <FAQ />
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ReferralPage;
