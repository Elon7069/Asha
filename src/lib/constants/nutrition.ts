/**
 * Local Food Database
 * Iron-rich foods commonly available in rural India
 */

export interface LocalFood {
  name: string
  nameHindi: string
  iron_mg_per_100g: number
  cost_friendly: boolean
  availability: 'year-round' | 'winter' | 'summer' | 'monsoon'
  serving_suggestion: string
  serving_suggestionHindi: string
  emoji: string
}

export const localIronRichFoods: LocalFood[] = [
  {
    name: 'Chickpeas (Chana)',
    nameHindi: 'चना',
    iron_mg_per_100g: 6.2,
    cost_friendly: true,
    availability: 'year-round',
    serving_suggestion: 'Soak overnight and boil. Eat with roti or rice.',
    serving_suggestionHindi: 'रात को भिगोकर सुबह उबालें। रोटी या चावल के साथ खाएं।',
    emoji: '🫘'
  },
  {
    name: 'Spinach (Palak/Saag)',
    nameHindi: 'पालक/साग',
    iron_mg_per_100g: 2.7,
    cost_friendly: true,
    availability: 'winter',
    serving_suggestion: 'Cook with tomatoes and garlic. Eat with roti.',
    serving_suggestionHindi: 'टमाटर और लहसुन के साथ पकाएं। रोटी के साथ खाएं।',
    emoji: '🥬'
  },
  {
    name: 'Jaggery (Gur)',
    nameHindi: 'गुड़',
    iron_mg_per_100g: 11.0,
    cost_friendly: true,
    availability: 'year-round',
    serving_suggestion: 'Add to milk or tea. Eat a small piece after meals.',
    serving_suggestionHindi: 'दूध या चाय में डालें। खाने के बाद एक छोटा टुकड़ा खाएं।',
    emoji: '🍯'
  },
  {
    name: 'Lentils (Dal)',
    nameHindi: 'दाल',
    iron_mg_per_100g: 3.3,
    cost_friendly: true,
    availability: 'year-round',
    serving_suggestion: 'Cook daily. Eat with rice or roti.',
    serving_suggestionHindi: 'रोज़ पकाएं। चावल या रोटी के साथ खाएं।',
    emoji: '🥣'
  },
  {
    name: 'Dates (Khajoor)',
    nameHindi: 'खजूर',
    iron_mg_per_100g: 1.0,
    cost_friendly: false,
    availability: 'year-round',
    serving_suggestion: 'Eat 2-3 dates daily. Soak in water overnight for better digestion.',
    serving_suggestionHindi: 'रोज़ 2-3 खजूर खाएं। पाचन के लिए रात को पानी में भिगोएं।',
    emoji: '🌴'
  },
  {
    name: 'Pomegranate (Anar)',
    nameHindi: 'अनार',
    iron_mg_per_100g: 0.3,
    cost_friendly: false,
    availability: 'winter',
    serving_suggestion: 'Eat fresh or drink juice. Best in morning.',
    serving_suggestionHindi: 'ताज़ा खाएं या जूस पिएं। सुबह सबसे अच्छा।',
    emoji: '🍎'
  },
  {
    name: 'Beetroot (Chukandar)',
    nameHindi: 'चुकंदर',
    iron_mg_per_100g: 0.8,
    cost_friendly: true,
    availability: 'winter',
    serving_suggestion: 'Add to salads or make juice. Cook in sabzi.',
    serving_suggestionHindi: 'सलाद में डालें या जूस बनाएं। सब्ज़ी में पकाएं।',
    emoji: '🍠'
  },
  {
    name: 'Fenugreek Leaves (Methi)',
    nameHindi: 'मेथी',
    iron_mg_per_100g: 1.9,
    cost_friendly: true,
    availability: 'winter',
    serving_suggestion: 'Cook as sabzi. Add to paratha.',
    serving_suggestionHindi: 'सब्ज़ी के रूप में पकाएं। पराठे में डालें।',
    emoji: '🌿'
  },
  {
    name: 'Sesame Seeds (Til)',
    nameHindi: 'तिल',
    iron_mg_per_100g: 14.6,
    cost_friendly: true,
    availability: 'year-round',
    serving_suggestion: 'Roast and add to ladoo or chutney. Sprinkle on roti.',
    serving_suggestionHindi: 'भूनकर लड्डू या चटनी में डालें। रोटी पर छिड़कें।',
    emoji: '🌰'
  },
  {
    name: 'Amaranth Leaves (Chaulai)',
    nameHindi: 'चौलाई',
    iron_mg_per_100g: 2.3,
    cost_friendly: true,
    availability: 'monsoon',
    serving_suggestion: 'Cook as saag. Very nutritious.',
    serving_suggestionHindi: 'साग के रूप में पकाएं। बहुत पौष्टिक।',
    emoji: '🌱'
  }
]

/**
 * Get foods by availability season
 */
export function getFoodsBySeason(season: LocalFood['availability']): LocalFood[] {
  return localIronRichFoods.filter(food => 
    food.availability === season || food.availability === 'year-round'
  )
}

/**
 * Get cost-friendly foods only
 */
export function getCostFriendlyFoods(): LocalFood[] {
  return localIronRichFoods.filter(food => food.cost_friendly)
}

/**
 * Calculate total iron from foods consumed
 */
export function calculateIronFromFoods(foodNames: string[], quantities: number[]): number {
  let totalIron = 0
  
  foodNames.forEach((name, index) => {
    const food = localIronRichFoods.find(
      f => f.name.toLowerCase().includes(name.toLowerCase()) ||
           f.nameHindi.includes(name)
    )
    
    if (food && quantities[index]) {
      // quantities in grams
      const iron = (food.iron_mg_per_100g / 100) * quantities[index]
      totalIron += iron
    }
  })
  
  return Math.round(totalIron * 10) / 10 // Round to 1 decimal
}

