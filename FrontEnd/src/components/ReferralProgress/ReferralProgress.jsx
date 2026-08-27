import { motion } from 'framer-motion';
import { Trophy, Target, Megaphone } from 'lucide-react';

import styles from './ReferralProgress.module.css';
import CoinScatterBackground from '../common/CoinScatterBackground';

function ReferralProgress({ dashboard, milestones }) {
  const pendingReferral =
    dashboard?.recentReferrals?.find(
      (referral) => referral.status === 'PENDING',
    );

  const current =
    pendingReferral?.eligibleAdsWatched ?? 0;

  // Use backend-controlled ad milestones
  const adMilestones = (milestones || [])
    .filter(
      (milestone) =>
        milestone.requiredAds != null,
    )
    .sort(
      (a, b) =>
        a.requiredAds - b.requiredAds,
    );

  // Find the next milestone that has not been reached
  const nextMilestone =
    adMilestones.find(
      (milestone) =>
        milestone.requiredAds > current,
    ) || null;

  // If all milestones are reached, use the final milestone
  const finalMilestone =
    adMilestones[adMilestones.length - 1] ||
    null;

  const target =
    nextMilestone?.requiredAds ??
    finalMilestone?.requiredAds ??
    0;

  const percent =
    target > 0
      ? Math.min(
          100,
          Math.round((current / target) * 100),
        )
      : 0;

  const remaining =
    Math.max(0, target - current);

  const milestoneReached =
    finalMilestone &&
    current >= finalMilestone.requiredAds;

  const rewardLabel = nextMilestone
    ? `${nextMilestone.rewardAmount} ${nextMilestone.rewardType}`
    : finalMilestone
      ? `${finalMilestone.rewardAmount} ${finalMilestone.rewardType}`
      : 'No milestones available';

  return (
    <motion.div
      className={styles.panel}
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: '-60px',
      }}
      transition={{
        duration: 0.6,
      }}
    >
      <CoinScatterBackground />

      <motion.div
        className={styles.megaphoneWrap}
        animate={{
          scale: [1, 1.18, 1],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      >
        <Megaphone size={22} />

        <motion.span
          className={styles.pulseRing}
          animate={{
            scale: [1, 1.8],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 1.2,
            ease: 'easeOut',
          }}
        />
      </motion.div>

      <div className={styles.top}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBadge}>
            <Target size={20} />
          </div>

          <div>
            <h3 className={styles.title}>
              Next Milestone
            </h3>

            <p className={styles.subtitle}>
              {!pendingReferral
                ? 'No pending referral is currently progressing'
                : milestoneReached
                  ? 'All ad-watch milestones reached!'
                  : `${remaining} more eligible ad watches to unlock ${rewardLabel}`}
            </p>
          </div>
        </div>

        <div className={styles.rewardChip}>
          <Trophy size={16} />

          <span>
            {nextMilestone
              ? `${nextMilestone.requiredAds} Ad Watches`
              : finalMilestone
                ? `${finalMilestone.requiredAds} Ad Watches`
                : 'No Milestone'}
          </span>
        </div>
      </div>

      <div className={styles.barTrack}>
        <motion.div
          className={styles.barFill}
          initial={{
            width: 0,
          }}
          whileInView={{
            width: `${percent}%`,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />

        <motion.div
          className={styles.barGlowDot}
          initial={{
            left: '0%',
            opacity: 0,
          }}
          whileInView={{
            left: `${percent}%`,
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: 0.2,
          }}
        />
      </div>

      <div className={styles.bottom}>
        <span className={styles.countLabel}>
          <strong>{current}</strong> /{' '}
          {target} ad watches
        </span>

        <span className={styles.percentLabel}>
          {percent}%
        </span>
      </div>
    </motion.div>
  );
}

export default ReferralProgress;