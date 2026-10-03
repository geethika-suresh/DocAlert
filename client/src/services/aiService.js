// SRS Section 7.3 & 1.2: Optional Category Suggestion
// Rule-based mock AI — NO API KEY, NO PAID SERVICE
// 800ms simulated delay to mimic AI response (SRS Tech Philosophy: free)

const CATEGORY_RULES = {
  'Identity Document': [
    'passport', 'national id', 'voter id', 'voter card', 'aadhaar', 'aadhar', 'pan card',
    'pan', 'driving licence', 'driver license', 'driving license', 'identity', 'id card',
    'birth certificate', 'birth cert', 'citizenship',
  ],
  'Certificate': [
    'certificate', 'certification', 'degree', 'diploma', 'marksheet', 'mark sheet',
    'transcript', 'graduation', 'course completion', 'training', 'workshop',
    'internship certificate', 'experience certificate', 'bonafide', 'conduct certificate',
    'noc', 'no objection', 'skill certificate', 'online course', 'udemy', 'coursera',
  ],
  'Insurance': [
    'insurance', 'policy', 'health insurance', 'life insurance', 'vehicle insurance',
    'car insurance', 'bike insurance', 'medical insurance', 'term insurance',
    'travel insurance', 'home insurance', 'accident cover', 'coverage',
  ],
  'Government ID': [
    'government', 'govt', 'ration card', 'ration', 'caste certificate', 'caste',
    'income certificate', 'income', 'domicile', 'residence proof', 'address proof',
    'property tax', 'labour card', 'employment card', 'epf', 'esi',
    'gst', 'registration', 'license', 'permit', 'renewal',
  ],
};

const normalise = (text) => text.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ' ');

/**
 * SRS Section 7.3: Suggest a document category based on the document name.
 * Rule-based keyword matching with safe fallback to "Other".
 * @param {string} documentName
 * @returns {Promise<{ suggestedCategory: string, confidence: string, matchedKeyword: string|null }>}
 */
export const suggestCategory = async (documentName) => {
  await new Promise((r) => setTimeout(r, 800)); // Simulate AI delay

  if (!documentName || documentName.trim().length < 2) {
    return { suggestedCategory: 'Other', confidence: 'low', matchedKeyword: null };
  }

  const normalised = normalise(documentName);

  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    for (const keyword of keywords) {
      if (normalised.includes(keyword)) {
        return {
          suggestedCategory: category,
          confidence: keyword.length > 5 ? 'high' : 'medium',
          matchedKeyword: keyword,
        };
      }
    }
  }

  // SRS: No match → safe fallback "Other"
  return { suggestedCategory: 'Other', confidence: 'low', matchedKeyword: null };
};

/**
 * Analyse a list of documents and return insights.
 * Mock AI — returns structured JSON as per SRS AI requirements.
 * @param {Array} documents
 * @returns {Promise<object>}
 */
export const analyseDocuments = async (documents) => {
  await new Promise((r) => setTimeout(r, 600));

  if (!documents || documents.length === 0) {
    return {
      totalAnalysed: 0,
      insights: [],
      recommendations: ['Start by adding your important documents to DocAlert.'],
      riskScore: 0,
    };
  }

  const expired      = documents.filter((d) => d.status === 'Expired');
  const expiringSoon = documents.filter((d) => d.status === 'Expiring Soon');
  const active       = documents.filter((d) => d.status === 'Active');

  const insights = [];
  const recommendations = [];

  if (expired.length > 0) {
    insights.push(`You have ${expired.length} expired document${expired.length > 1 ? 's' : ''} that need${expired.length === 1 ? 's' : ''} immediate attention.`);
    recommendations.push(`Renew your expired document${expired.length > 1 ? 's' : ''}: ${expired.map((d) => d.name).join(', ')}.`);
  }

  if (expiringSoon.length > 0) {
    const soonest = expiringSoon.reduce((a, b) => a.daysRemaining < b.daysRemaining ? a : b);
    insights.push(`${expiringSoon.length} document${expiringSoon.length > 1 ? 's are' : ' is'} expiring soon. "${soonest.name}" is the most urgent.`);
    recommendations.push(`Schedule renewal for: ${expiringSoon.map((d) => `${d.name} (${d.daysRemaining}d)`).join(', ')}.`);
  }

  if (active.length > 0 && expired.length === 0 && expiringSoon.length === 0) {
    insights.push('All your documents are active and up to date. Great job!');
    recommendations.push('Keep checking back to stay on top of your document renewals.');
  }

  const categoryCount = documents.reduce((acc, d) => { acc[d.category] = (acc[d.category] || 0) + 1; return acc; }, {});
  const dominantCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  if (dominantCategory) {
    insights.push(`Most of your documents are in the "${dominantCategory[0]}" category (${dominantCategory[1]} document${dominantCategory[1] > 1 ? 's' : ''}).`);
  }

  const riskScore = Math.min(100, Math.round((expired.length * 40 + expiringSoon.length * 20) / Math.max(documents.length, 1) * 100));

  return {
    totalAnalysed: documents.length,
    breakdown: { active: active.length, expiringSoon: expiringSoon.length, expired: expired.length },
    insights,
    recommendations,
    riskScore,
    riskLevel: riskScore >= 60 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low',
  };
};

/**
 * Get renewal tips for a specific document category.
 */
export const getRenewalTips = async (category) => {
  await new Promise((r) => setTimeout(r, 400));

  const tips = {
    'Identity Document': [
      'Carry original documents when renewing at government offices.',
      'Check renewal timelines — passports may take 4-6 weeks to process.',
      'Keep photocopies of all identity documents stored safely.',
    ],
    'Certificate': [
      'Request attestation of certificates from the issuing authority.',
      'Store digital copies in a secure cloud location.',
      'Check if the certificate has a validity period or is lifetime valid.',
    ],
    'Insurance': [
      'Compare policies before renewing to get better coverage.',
      'Set auto-renewal reminders at least 30 days before expiry.',
      'Check for no-claim bonuses before switching insurers.',
    ],
    'Government ID': [
      'Visit the official government portal for online renewal options.',
      'Carry proof of address and identity when visiting offices.',
      'Apply well in advance to avoid last-minute rush.',
    ],
    'Other': [
      'Check the issuing authority website for renewal instructions.',
      'Keep track of all renewal fees and required documents.',
      'Set reminders at 30, 15, and 7 days before expiry.',
    ],
  };

  return { category, tips: tips[category] || tips['Other'] };
};
