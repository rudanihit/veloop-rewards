import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { referralInfo } from '../../utils/dummyData';
import styles from './ReferralCard.module.css';

function ReferralCard() {
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <span className={styles.label}>Your Referral Code</span>
          <span className={styles.value}>{referralInfo.code}</span>
        </div>
        <button
          className={styles.copyBtn}
          onClick={() => handleCopy(referralInfo.code, 'code')}
          aria-label="Copy referral code"
        >
          {copiedField === 'code' ? <Check size={18} /> : <Copy size={18} />}
          {copiedField === 'code' ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.row}>
        <div className={styles.field}>
          <span className={styles.label}>Referral Link</span>
          <span className={styles.valueSmall}>{referralInfo.link}</span>
        </div>
        <button
          className={styles.copyBtn}
          onClick={() => handleCopy(referralInfo.link, 'link')}
          aria-label="Copy referral link"
        >
          {copiedField === 'link' ? <Check size={18} /> : <Copy size={18} />}
          {copiedField === 'link' ? 'Copied' : 'Copy'}
        </button>
      </div>
    </motion.div>
  );
}

export default ReferralCard;
