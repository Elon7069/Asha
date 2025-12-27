/**
 * Pregnancy Week-by-Week Information
 * Content for each week of pregnancy
 */

export interface PregnancyWeekData {
  week: number
  title: string
  titleHindi: string
  description: string
  descriptionHindi: string
  nutritionTip: string
  nutritionTipHindi: string
  warningSigns: string[]
  warningSignsHindi: string[]
  audioLessonId?: string
}

export const pregnancyWeeks: PregnancyWeekData[] = [
  {
    week: 1,
    title: 'Week 1: Beginning of Your Journey',
    titleHindi: 'सप्ताह 1: आपकी यात्रा की शुरुआत',
    description: 'Your body is preparing for pregnancy. Track your cycle carefully.',
    descriptionHindi: 'आपका शरीर गर्भावस्था के लिए तैयार हो रहा है। अपने चक्र को ध्यान से ट्रैक करें।',
    nutritionTip: 'Start taking folic acid supplements',
    nutritionTipHindi: 'फोलिक एसिड सप्लीमेंट लेना शुरू करें',
    warningSigns: ['Heavy bleeding', 'Severe pain'],
    warningSignsHindi: ['भारी रक्तस्राव', 'तेज़ दर्द']
  },
  {
    week: 8,
    title: 'Week 8: Baby\'s Heart is Beating',
    titleHindi: 'सप्ताह 8: बच्चे का दिल धड़क रहा है',
    description: 'Your baby\'s heart has started beating. This is an important milestone.',
    descriptionHindi: 'आपके बच्चे का दिल धड़कना शुरू हो गया है। यह एक महत्वपूर्ण मील का पत्थर है।',
    nutritionTip: 'Eat iron-rich foods daily. Include dal, palak, and jaggery.',
    nutritionTipHindi: 'रोज़ आयरन युक्त भोजन खाएं। दाल, पालक, और गुड़ शामिल करें।',
    warningSigns: ['Heavy bleeding', 'Severe cramping', 'Fainting'],
    warningSignsHindi: ['भारी रक्तस्राव', 'तेज़ ऐंठन', 'बेहोशी']
  },
  {
    week: 12,
    title: 'Week 12: End of First Trimester',
    titleHindi: 'सप्ताह 12: पहली तिमाही का अंत',
    description: 'Congratulations! You\'ve completed the first trimester. Morning sickness may reduce.',
    descriptionHindi: 'बधाई हो! आपने पहली तिमाही पूरी कर ली है। सुबह की बीमारी कम हो सकती है।',
    nutritionTip: 'Continue IFA tablets. Eat small, frequent meals.',
    nutritionTipHindi: 'IFA गोलियां जारी रखें। छोटे, बार-बार भोजन खाएं।',
    warningSigns: ['Heavy bleeding', 'Severe pain', 'High fever'],
    warningSignsHindi: ['भारी रक्तस्राव', 'तेज़ दर्द', 'तेज़ बुखार']
  },
  {
    week: 20,
    title: 'Week 20: Halfway There!',
    titleHindi: 'सप्ताह 20: आधा रास्ता तय!',
    description: 'You\'re halfway through your pregnancy. You may start feeling baby movements.',
    descriptionHindi: 'आपने अपनी गर्भावस्था का आधा रास्ता तय कर लिया है। आप बच्चे की हलचल महसूस करना शुरू कर सकती हैं।',
    nutritionTip: 'Increase protein intake. Eat eggs, dal, and paneer if available.',
    nutritionTipHindi: 'प्रोटीन का सेवन बढ़ाएं। अगर उपलब्ध हो तो अंडे, दाल, और पनीर खाएं।',
    warningSigns: ['No fetal movement', 'Severe swelling', 'Severe headache'],
    warningSignsHindi: ['बच्चा नहीं हिल रहा', 'तेज़ सूजन', 'तेज़ सिर दर्द']
  },
  {
    week: 28,
    title: 'Week 28: Third Trimester Begins',
    titleHindi: 'सप्ताह 28: तीसरी तिमाही शुरू',
    description: 'Welcome to the third trimester! Baby is growing rapidly now.',
    descriptionHindi: 'तीसरी तिमाही में आपका स्वागत है! अब बच्चा तेज़ी से बढ़ रहा है।',
    nutritionTip: 'Eat calcium-rich foods. Include milk, curd, and green vegetables.',
    nutritionTipHindi: 'कैल्शियम युक्त भोजन खाएं। दूध, दही, और हरी सब्ज़ियां शामिल करें।',
    warningSigns: ['Decreased fetal movement', 'Severe swelling', 'Vision problems'],
    warningSignsHindi: ['बच्चे की कम हलचल', 'तेज़ सूजन', 'दृष्टि समस्याएं']
  },
  {
    week: 36,
    title: 'Week 36: Almost There!',
    titleHindi: 'सप्ताह 36: लगभग पहुंच गए!',
    description: 'Your baby is almost ready. Prepare for delivery. Pack your hospital bag.',
    descriptionHindi: 'आपका बच्चा लगभग तैयार है। डिलीवरी के लिए तैयारी करें। अस्पताल का बैग तैयार करें।',
    nutritionTip: 'Continue healthy eating. Stay hydrated.',
    nutritionTipHindi: 'स्वस्थ खाना जारी रखें। हाइड्रेटेड रहें।',
    warningSigns: ['Water breaking', 'Regular contractions', 'Heavy bleeding'],
    warningSignsHindi: ['पानी निकलना', 'नियमित संकुचन', 'भारी रक्तस्राव']
  }
]

/**
 * Get week data by week number
 */
export function getWeekData(weekNumber: number): PregnancyWeekData | null {
  const weekData = pregnancyWeeks.find(w => w.week === weekNumber)
  
  if (weekData) return weekData
  
  // Generate generic data for weeks not in database
  const trimester = weekNumber <= 12 ? 'first' : weekNumber <= 27 ? 'second' : 'third'
  
  return {
    week: weekNumber,
    title: `Week ${weekNumber}`,
    titleHindi: `${weekNumber} सप्ताह`,
    description: `You are in your ${trimester} trimester. Continue regular checkups.`,
    descriptionHindi: `आप अपनी ${trimester === 'first' ? 'पहली' : trimester === 'second' ? 'दूसरी' : 'तीसरी'} तिमाही में हैं। नियमित जांच जारी रखें।`,
    nutritionTip: 'Eat balanced meals with iron and protein.',
    nutritionTipHindi: 'आयरन और प्रोटीन के साथ संतुलित भोजन खाएं।',
    warningSigns: ['Heavy bleeding', 'Severe pain'],
    warningSignsHindi: ['भारी रक्तस्राव', 'तेज़ दर्द']
  }
}

/**
 * Get all weeks for a trimester
 */
export function getWeeksForTrimester(trimester: 1 | 2 | 3): PregnancyWeekData[] {
  if (trimester === 1) {
    return pregnancyWeeks.filter(w => w.week <= 12)
  } else if (trimester === 2) {
    return pregnancyWeeks.filter(w => w.week > 12 && w.week <= 27)
  } else {
    return pregnancyWeeks.filter(w => w.week > 27)
  }
}

