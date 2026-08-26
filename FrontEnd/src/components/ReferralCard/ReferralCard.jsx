import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

import ConfettiBurst from '../common/ConfettiBurst';
import Toast from '../common/Toast';

import styles from './ReferralCard.module.css';

function ReferralCard({ dashboard }) {
  const [copiedField, setCopiedField] = useState(null);
  const [burstId, setBurstId] = useState(0);
  const [toast, setToast] = useState({
    show: false,
    message: '',
  });

  const referralCode =
    dashboard?.referralCode || '';

  const referralLink =
    dashboard?.referralLink || '';

  const fullReferralLink = referralLink
    ? new URL(
        referralLink,
        window.location.origin,
      ).toString()
    : '';

  const handleCopy = async (
    text,
    field,
    label,
  ) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);

      setCopiedField(field);
      setBurstId((id) => id + 1);

      setToast({
        show: true,
        message: `${label} copied!`,
      });

      setTimeout(
        () => setCopiedField(null),
        2000,
      );

      setTimeout(
        () =>
          setToast({
            show: false,
            message: '',
          }),
        2200,
      );
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{
        opacity: 0,
        y: 30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
        delay: 0.3,
      }}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <span className={styles.label}>
            Your Referral Code
          </span>

          <span className={styles.value}>
            {referralCode || 'Loading...'}
          </span>
        </div>

        <div className={styles.copyBtnWrap}>
          <ConfettiBurst
            burstId={
              copiedField === 'code'
                ? burstId
                : 0
            }
          />

          <button
            className={styles.copyBtn}
            onClick={() =>
              handleCopy(
                referralCode,
                'code',
                'Referral code',
              )
            }
            aria-label="Copy referral code"
          >
            {copiedField === 'code' ? (
              <Check size={18} />
            ) : (
              <Copy size={18} />
            )}

            {copiedField === 'code'
              ? 'Copied'
              : 'Copy'}
          </button>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.field}>
          <span className={styles.label}>
            Referral Link
          </span>

          <span className={styles.valueSmall}>
            {fullReferralLink ||
              'Loading...'}
          </span>
        </div>

        <div className={styles.copyBtnWrap}>
          <ConfettiBurst
            burstId={
              copiedField === 'link'
                ? burstId
                : 0
            }
          />

          <button
            className={styles.copyBtn}
            onClick={() =>
              handleCopy(
                fullReferralLink,
                'link',
                'Referral link',
              )
            }
            aria-label="Copy referral link"
          >
            {copiedField === 'link' ? (
              <Check size={18} />
            ) : (
              <Copy size={18} />
            )}

            {copiedField === 'link'
              ? 'Copied'
              : 'Copy'}
          </button>
        </div>
      </div>

      <Toast
        show={toast.show}
        message={toast.message}
      />
    </motion.div>
  );
}

export default ReferralCard;