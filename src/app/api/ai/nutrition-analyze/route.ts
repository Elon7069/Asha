import { NextRequest, NextResponse } from 'next/server'
import { mistralClient } from '@/lib/ai/mistral'
import { calculateIronFromFoods, localIronRichFoods } from '@/lib/constants/nutrition'

/**
 * Nutrition Analysis API
 * Analyzes meal descriptions and provides nutritional insights
 */
export async function POST(request: NextRequest) {
  try {
    const { mealDescription, language = 'hi' } = await request.json()
    
    if (!mealDescription || !mealDescription.trim()) {
      return NextResponse.json(
        { error: 'Meal description is required' },
        { status: 400 }
      )
    }
    
    // Extract foods from description using AI
    const extractionPrompt = `Extract food items from this meal description. Return a JSON array of food names mentioned.

Description: "${mealDescription}"

Return format: ["food1", "food2", "food3"]
Only return the JSON array, no other text.`

    const response = await mistralClient.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'user', content: extractionPrompt }
      ],
      temperature: 0.3,
      maxTokens: 200
    })
    
    const content = response.choices?.[0]?.message?.content || '[]'
    const foodsArray = JSON.parse(content.replace(/```json\n?|\n?```/g, ''))
    
    // Match foods to our database
    const matchedFoods = foodsArray.map((foodName: string) => {
      return localIronRichFoods.find(
        f => f.name.toLowerCase().includes(foodName.toLowerCase()) ||
             f.nameHindi.includes(foodName)
      )
    }).filter(Boolean)
    
    // Calculate nutritional values
    const quantities = matchedFoods.map(() => 100) // Assume 100g servings
    const estimatedIron = calculateIronFromFoods(
      matchedFoods.map(f => f!.name),
      quantities
    )
    
    // Estimate protein (simplified - dal, chana are protein-rich)
    const proteinRichFoods = matchedFoods.filter(f => 
      f!.name.toLowerCase().includes('dal') ||
      f!.name.toLowerCase().includes('chana') ||
      f!.name.toLowerCase().includes('lentil')
    )
    const estimatedProtein = proteinRichFoods.length * 8 // ~8g per serving
    
    // Estimate calories (simplified)
    const estimatedCalories = matchedFoods.length * 150 // ~150 cal per serving
    
    // Calculate quality score (0-100)
    let qualityScore = 50 // Base score
    
    if (estimatedIron >= 10) qualityScore += 20
    else if (estimatedIron >= 5) qualityScore += 10
    
    if (estimatedProtein >= 15) qualityScore += 15
    else if (estimatedProtein >= 8) qualityScore += 8
    
    if (matchedFoods.length >= 3) qualityScore += 15 // Variety
    
    qualityScore = Math.min(100, qualityScore)
    
    // Generate suggestions
    const suggestions = []
    if (estimatedIron < 5) {
      suggestions.push(
        language === 'hi' 
          ? 'अधिक आयरन के लिए पालक या गुड़ जोड़ें'
          : 'Add spinach or jaggery for more iron'
      )
    }
    if (estimatedProtein < 10) {
      suggestions.push(
        language === 'hi'
          ? 'प्रोटीन के लिए दाल या चना जोड़ें'
          : 'Add dal or chana for protein'
      )
    }
    
    return NextResponse.json({
      foods_consumed: matchedFoods.map(f => f!.name),
      estimated_iron_mg: estimatedIron,
      estimated_protein_g: estimatedProtein,
      estimated_calories: estimatedCalories,
      nutritional_quality_score: qualityScore,
      suggestions,
      matched_foods: matchedFoods
    })
    
  } catch (error: any) {
    console.error('Nutrition analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze nutrition' },
      { status: 500 }
    )
  }
}

