import { motion } from 'framer-motion';
import { UserPlus, Trophy } from 'lucide-react';

import FloatingOrbs from '../common/FloatingOrbs';
import CoinScatterBackground from '../common/CoinScatterBackground';
import styles from './RewardTimeline.module.css';

const milestoneRewards = [
  {
    id: 'r1',
    title: '5000 SVE',
    condition: 'Friend completes 15 Ad Watch tasks',
    requiredTasks: 15,
  },
  {
    id: 'r2',
    title: '2 Lucky Spins',
    condition: 'Friend completes 20 Ad Watch tasks',
    requiredTasks: 20,
  },
  {
    id: 'r3',
    title: '5000 Tokens',
    condition: 'Friend completes 30 Ad Watch tasks',
    requiredTasks: 30,
  },
  {
    id: 'r4',
    title: '10 Gems',
    condition: 'Friend completes 35 Ad Watch tasks',
    requiredTasks: 35,
  },
];

function RewardTimeline({ dashboard }) {
  const pendingReferral =
    dashboard?.recentReferrals?.find(
      (referral) => referral.status === 'PENDING',
    );

  const currentAds =
    pendingReferral?.eligibleAdsWatched ?? 0;

  const steps = [
    {
      id: 'start',
      title: 'Registration',
      desc: 'You joined the referral program',
      achieved: true,
      isStart: true,
    },

    ...milestoneRewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      desc: reward.condition,
      achieved:
        currentAds >= reward.requiredTasks,
    })),
  ];

  const achievedSteps = steps.filter(
    (step) => step.achieved,
  ).length;

  const progress =
    steps.length > 0
      ? achievedSteps / steps.length
      : 0;

  return (
    <div className={styles.panel}>
      <CoinScatterBackground />

      <FloatingOrbs />

      <motion.div
        className={styles.header}
        initial={{
          opacity: 0,
          y: 16,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        <h2 className={styles.title}>
          Your Reward Journey
        </h2>

        <p className={styles.subtitle}>
          Every referral brings you closer to
          the next reward
        </p>
      </motion.div>

      <div className={styles.timeline}>
        <div className={styles.trackBg} />

        <motion.div
          className={styles.trackFill}
          initial={{
            scaleY: 0,
          }}
          whileInView={{
            scaleY: progress,
          }}
          viewport={{
            once: true,
            margin: '-100px',
          }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
          }}
          style={{
            transformOrigin: 'top',
          }}
        />

        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            className={styles.step}
            initial={{
              opacity: 0,
              x: -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: '-60px',
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.12,
            }}
          >
            <div
              className={`${styles.node} ${
                step.achieved
                  ? styles.nodeAchieved
                  : ''
              }`}
            >
              {step.isStart ? (
                <UserPlus size={16} />
              ) : (
                <Trophy size={16} />
              )}
            </div>

            <div className={styles.content}>
              <h4 className={styles.stepTitle}>
                {step.title}
              </h4>

              <p className={styles.stepDesc}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default RewardTimeline;