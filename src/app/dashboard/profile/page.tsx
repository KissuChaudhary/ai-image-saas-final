'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  full_name?: string
  username?: string
  website?: string
  bio?: string
}

export default function ProfileSettings() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data || { id: user.id })
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.id) return

    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      // Validate username length
      if (profile.username && profile.username.length < 3) {
        throw new Error('Username must be at least 3 characters long')
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          website: profile.website,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        if (error.code === '23505') {
          throw new Error('Username is already taken')
        }
        throw error
      }

      setSuccessMessage('Profile updated successfully')
      router.refresh() // Refresh the page to update any displayed profile data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="mt-2 text-white/60">
          Manage your profile information and settings.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-500">{successMessage}</p>
        </div>
      )}

      <div className="bg-[#111111] rounded-2xl p-8 border border-white/5">
        {/* Profile Form */}
        <form onSubmit={updateProfile}>
          <div className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profile?.username || ''}
                onChange={(e) => setProfile(profile ? { ...profile, username: e.target.value } : null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Choose a username"
              />
              <p className="mt-1 text-sm text-white/60">
                This will be your public username visible to other users.
              </p>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-white mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={profile?.website || ''}
                onChange={(e) => setProfile(profile ? { ...profile, website: e.target.value } : null)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={profile?.bio || ''}
                onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/20"
                placeholder="Write a short bio about yourself"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

