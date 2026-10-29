async function createListing({
  cropName,
  quantityKg,
  village = 'Ziro Valley',
  qualityGrade = 'Grade A',
  ratePerKg
}) {
  try {
    if (!supabaseClient) {
      throw new Error('Supabase client is not connected.');
    }

    const { data, error } = await supabaseClient
      .from('listings')
      .insert([
        {
          crop_name: cropName,
          quantity_kg: Number(quantityKg),
          village: village,
          quality_grade: qualityGrade,
          rate_per_kg: Number(ratePerKg),
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Listing created in Supabase:', data);

    return {
      success: true,
      listing: data
    };
  } catch (err) {
    console.warn(
      '⚠️ Supabase error (Running in Fallback Demo Mode):',
      err.message
    );

    const mockListing = {
      id: 'list-' + Date.now(),
      crop_name: cropName,
      quantity_kg: Number(quantityKg),
      village: village,
      quality_grade: qualityGrade,
      rate_per_kg: Number(ratePerKg),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    return {
      success: true,
      listing: mockListing,
      isMock: true
    };
  }
}

async function fetchVillageListings(villageName = 'Ziro Valley') {
  try {
    if (!supabaseClient) {
      throw new Error('Supabase client is not connected.');
    }

    const { data, error } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('village', villageName)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (err) {
    console.warn(
      '⚠️ Could not fetch listings from Supabase:',
      err.message
    );

    return [];
  }
}

async function updateListingStatus(listingId, newStatus) {
  try {
    if (!supabaseClient) {
      throw new Error('Supabase client is not connected.');
    }

    const allowedStatuses = ['pending', 'pooled', 'sold'];

    if (!allowedStatuses.includes(newStatus)) {
      throw new Error('Invalid listing status.');
    }

    const { data, error } = await supabaseClient
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listingId)
      .select();

    if (error) throw error;

    return {
      success: true,
      updated: data
    };
  } catch (err) {
    console.error('❌ Failed to update listing status:', err.message);

    return {
      success: false,
      error: err.message
    };
  }
}