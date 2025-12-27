import { NextRequest, NextResponse } from 'next/server'
import { extractVisitData } from '@/lib/ai/mistral'
import { getSupabaseClient } from '@/lib/supabase/server'

/**
 * Voice Processing API
 * Extracts structured medical data from ASHA worker visit transcriptions
 */
export async function POST(request: NextRequest) {
  try {
    const { transcription, asha_worker_id } = await request.json()
    
    if (!transcription || !transcription.trim()) {
      return NextResponse.json(
        { error: 'Transcription text is required' },
        { status: 400 }
      )
    }
    
    // Extract structured data using AI
    const extractedData = await extractVisitData(transcription)
    
    // Find beneficiary by name if mentioned
    let beneficiary = null
    if (extractedData.patient_name) {
      const supabase = await getSupabaseClient()
      
      // Get ASHA worker's user_id
      const { data: ashaProfile } = await supabase
        .from('asha_worker_profiles')
        .select('user_id')
        .eq('id', asha_worker_id)
        .single()
      
      if (ashaProfile) {
        // Find beneficiary by name in assigned users
        // Note: full_name and display_name are in asha_users, not asha_user_profiles
        // We need to join or query asha_users separately
        const { data: userProfiles } = await supabase
          .from('asha_user_profiles')
          .select('id, user_id, linked_asha_id')
          .eq('linked_asha_id', ashaProfile.user_id)
          .limit(20)
        
        if (userProfiles && userProfiles.length > 0) {
          // Get the asha_users records for these profiles to match by name
          const userIds = userProfiles.map(up => up.user_id)
          const { data: ashaUsers } = await supabase
            .from('asha_users')
            .select('id, full_name, display_name')
            .in('id', userIds)
            .or(`full_name.ilike.%${extractedData.patient_name}%,display_name.ilike.%${extractedData.patient_name}%`)
          
          if (ashaUsers && ashaUsers.length > 0) {
            const matchedUser = ashaUsers[0]
            const matchedProfile = userProfiles.find(up => up.user_id === matchedUser.id)
            if (matchedProfile) {
              beneficiary = {
                id: matchedProfile.id,
                user_id: matchedProfile.user_id,
                full_name: matchedUser.full_name,
                display_name: matchedUser.display_name
              }
            }
          }
        }
        
        // Old query kept for reference (doesn't work because fields don't exist in asha_user_profiles)
        // const { data: beneficiaries } = await supabase
        //   .from('asha_user_profiles')
        //   .select('id, user_id')
        //   .eq('linked_asha_id', ashaProfile.user_id)
        //   .limit(5)
        
      }
    }
    
    return NextResponse.json({
      extracted_data: extractedData,
      beneficiary,
      transcription,
      needs_manual_review: !beneficiary && extractedData.patient_name
    })
    
  } catch (error: any) {
    console.error('Voice processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process transcription' },
      { status: 500 }
    )
  }
}

