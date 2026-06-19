import { supabase } from '../config/supabase.js'

export async function saveTrip(inputs, plan, tripName) {
  const { data, error } = await supabase
    .from('trips')
    .insert([{ inputs, plan, trip_name: tripName }])
    .select()

  if (error) throw new Error(error.message)
  return data[0]
}

export async function getAllTrips() {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getTripById(id) {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteTrip(id) {
  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}
