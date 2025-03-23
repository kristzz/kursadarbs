"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/services/auth'
import { Spinner } from '@/components/spinner'
import BusinessProfile from '@/components/BusinessProfile'
import UserProfile from '@/components/UserProfile'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await api.get('/user/profile')
                console.log('User profile data:', response.data)
                setUser(response.data.user)
            } catch (error) {
                console.error('Profile load error:', error)
                router.push('/auth/login')
            } finally {
                setIsLoading(false)
            }
        }
        
        loadProfile()
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-backgroundc">
            {user?.role === 'employer' ? (
                <BusinessProfile user={user} />
            ) : (
                <UserProfile user={user} />
            )}
        </div>
    )
}