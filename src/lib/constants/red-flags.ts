/**
 * Red Flags / Danger Signs Constants
 * Medical danger signs that require immediate attention
 */

export interface RedFlag {
  id: string
  name: string
  nameHindi: string
  description: string
  descriptionHindi: string
  whenToSeekHelp: string
  whenToSeekHelpHindi: string
  icon: string
  severity: 'high' | 'critical'
  applicableStages: ('pregnancy' | 'menstrual' | 'postnatal')[]
}

export const redFlags: RedFlag[] = [
  {
    id: 'heavy_bleeding',
    name: 'Heavy Bleeding',
    nameHindi: 'भारी रक्तस्राव',
    description: 'Bleeding that soaks more than one pad per hour',
    descriptionHindi: 'एक घंटे में एक से ज़्यादा पैड भीग जाए',
    whenToSeekHelp: 'Seek immediate medical help',
    whenToSeekHelpHindi: 'तुरंत डॉक्टर से मिलें',
    icon: '🩸',
    severity: 'critical',
    applicableStages: ['pregnancy', 'menstrual', 'postnatal']
  },
  {
    id: 'severe_pain',
    name: 'Severe Abdominal Pain',
    nameHindi: 'तेज़ पेट दर्द',
    description: 'Severe pain that doesn\'t go away with rest',
    descriptionHindi: 'तेज़ दर्द जो आराम से न जाए',
    whenToSeekHelp: 'Go to hospital immediately',
    whenToSeekHelpHindi: 'तुरंत अस्पताल जाएं',
    icon: '😣',
    severity: 'critical',
    applicableStages: ['pregnancy', 'menstrual', 'postnatal']
  },
  {
    id: 'high_fever',
    name: 'High Fever',
    nameHindi: 'तेज़ बुखार',
    description: 'Fever above 38°C (100.4°F) that doesn\'t reduce',
    descriptionHindi: '38°C से ज़्यादा बुखार जो कम न हो',
    whenToSeekHelp: 'Contact ASHA worker or visit health center',
    whenToSeekHelpHindi: 'ASHA दीदी को बुलाएं या स्वास्थ्य केंद्र जाएं',
    icon: '🌡️',
    severity: 'high',
    applicableStages: ['pregnancy', 'postnatal']
  },
  {
    id: 'no_fetal_movement',
    name: 'No Fetal Movement',
    nameHindi: 'बच्चा नहीं हिल रहा',
    description: 'Baby not moving after 20 weeks of pregnancy',
    descriptionHindi: '20 सप्ताह के बाद बच्चा नहीं हिल रहा',
    whenToSeekHelp: 'Go to hospital immediately',
    whenToSeekHelpHindi: 'तुरंत अस्पताल जाएं',
    icon: '👶',
    severity: 'critical',
    applicableStages: ['pregnancy']
  },
  {
    id: 'severe_headache',
    name: 'Severe Headache with Vision Problems',
    nameHindi: 'तेज़ सिर दर्द और दिखाई न देना',
    description: 'Severe headache with blurred vision or seeing spots',
    descriptionHindi: 'तेज़ सिर दर्द और धुंधला दिखना या चक्कर',
    whenToSeekHelp: 'Emergency - go to hospital now',
    whenToSeekHelpHindi: 'आपातकाल - अभी अस्पताल जाएं',
    icon: '🤕',
    severity: 'critical',
    applicableStages: ['pregnancy']
  },
  {
    id: 'swelling',
    name: 'Severe Swelling',
    nameHindi: 'तेज़ सूजन',
    description: 'Sudden severe swelling of face, hands, or feet',
    descriptionHindi: 'चेहरे, हाथों, या पैरों में अचानक तेज़ सूजन',
    whenToSeekHelp: 'Contact health center immediately',
    whenToSeekHelpHindi: 'तुरंत स्वास्थ्य केंद्र से संपर्क करें',
    icon: '💧',
    severity: 'high',
    applicableStages: ['pregnancy']
  },
  {
    id: 'water_breaking',
    name: 'Water Breaking Before 37 Weeks',
    nameHindi: '37 सप्ताह से पहले पानी निकलना',
    description: 'Water breaking before full term (37 weeks)',
    descriptionHindi: 'पूरे समय (37 सप्ताह) से पहले पानी निकलना',
    whenToSeekHelp: 'Go to hospital immediately',
    whenToSeekHelpHindi: 'तुरंत अस्पताल जाएं',
    icon: '💦',
    severity: 'critical',
    applicableStages: ['pregnancy']
  },
  {
    id: 'fainting',
    name: 'Fainting or Dizziness',
    nameHindi: 'बेहोशी या चक्कर',
    description: 'Fainting, severe dizziness, or loss of consciousness',
    descriptionHindi: 'बेहोशी, तेज़ चक्कर, या होश खोना',
    whenToSeekHelp: 'Emergency - call 108 or go to hospital',
    whenToSeekHelpHindi: 'आपातकाल - 108 पर कॉल करें या अस्पताल जाएं',
    icon: '😵',
    severity: 'critical',
    applicableStages: ['pregnancy', 'menstrual', 'postnatal']
  },
  {
    id: 'breathing_difficulty',
    name: 'Difficulty Breathing',
    nameHindi: 'सांस लेने में तकलीफ',
    description: 'Severe shortness of breath or difficulty breathing',
    descriptionHindi: 'तेज़ सांस फूलना या सांस लेने में तकलीफ',
    whenToSeekHelp: 'Emergency - go to hospital immediately',
    whenToSeekHelpHindi: 'आपातकाल - तुरंत अस्पताल जाएं',
    icon: '😮‍💨',
    severity: 'critical',
    applicableStages: ['pregnancy', 'postnatal']
  },
  {
    id: 'severe_vomiting',
    name: 'Severe Vomiting',
    nameHindi: 'तेज़ उल्टी',
    description: 'Cannot keep any food or water down',
    descriptionHindi: 'कुछ भी खाना-पीना न रुके',
    whenToSeekHelp: 'Visit health center to prevent dehydration',
    whenToSeekHelpHindi: 'निर्जलीकरण से बचने के लिए स्वास्थ्य केंद्र जाएं',
    icon: '🤢',
    severity: 'high',
    applicableStages: ['pregnancy']
  }
]

/**
 * Get red flags for specific stage
 */
export function getRedFlagsForStage(
  stage: 'pregnancy' | 'menstrual' | 'postnatal'
): RedFlag[] {
  return redFlags.filter(flag => flag.applicableStages.includes(stage))
}

/**
 * Get critical red flags only
 */
export function getCriticalRedFlags(): RedFlag[] {
  return redFlags.filter(flag => flag.severity === 'critical')
}

