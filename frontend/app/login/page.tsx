'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
<<<<<<< HEAD
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [meterNumber, setMeterNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const { login, signup } = useAuth()

  // ---------------- SIGN IN ----------------
=======
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!email || !password) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      await login(email, password)
      router.push('/dashboard')
<<<<<<< HEAD
    } catch (error) {
      setError((error as Error)?.message || 'Login failed. Please try again.')
=======
    } catch {
      setError('Login failed. Please try again.')
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  // ---------------- SIGN UP ----------------
=======
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
<<<<<<< HEAD
      if (!email || !password || !name || !confirmPassword || !phone || !location || !meterNumber) {
=======
      if (!email || !password || !name || !confirmPassword) {
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

<<<<<<< HEAD
      // ✅ FIXED: now includes phone
      await signup({
        email,
        password,
        name,
        phone,
        location,
        meterId: meterNumber,
      })

      router.push('/dashboard')
    } catch (error) {
      setError((error as Error)?.message || 'Sign up failed. Please try again.')
=======
      await login(email, password)
      router.push('/dashboard')
    } catch {
      setError('Sign up failed. Please try again.')
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
    } finally {
      setIsLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-rose-50 to-pink-100">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-orange-100">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            ⚡ Smart Grid
          </h1>
          <p className="text-gray-500 text-sm tracking-wide">
=======
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-600">
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            ⚡ Smart Grid
          </h1>
          <p className="text-white/70 text-sm tracking-wide">
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
            Smart Monitoring and Billing System
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
<<<<<<< HEAD

          {/* Tabs */}
          <TabsList className="grid w-full grid-cols-2 bg-orange-100">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
=======
          
          {/* Tabs */}
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="signin" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" className="text-white data-[state=active]:bg-white data-[state=active]:text-black">
              Sign Up
            </TabsTrigger>
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
          </TabsList>

          {/* SIGN IN */}
          <TabsContent value="signin" className="space-y-4 mt-4">
            <form onSubmit={handleSignIn} className="space-y-4">

              {error && (
<<<<<<< HEAD
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
=======
                <div className="p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-200 text-sm">
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
                  {error}
                </div>
              )}

<<<<<<< HEAD
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-orange-400 text-white rounded-xl">
                {isLoading ? 'Signing in...' : 'Sign In'}
=======
              <div>
                <label className="block text-sm text-white mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In →'}
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
              </button>
            </form>
          </TabsContent>

          {/* SIGN UP */}
          <TabsContent value="signup" className="space-y-4 mt-4">
            <form onSubmit={handleSignUp} className="space-y-4">

              {error && (
<<<<<<< HEAD
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-600 text-sm">
=======
                <div className="p-3 bg-red-500/20 border border-red-400 rounded-lg text-red-200 text-sm">
>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
                  {error}
                </div>
              )}

<<<<<<< HEAD
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="Meter Number"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full px-4 py-2 border rounded-lg"
              />

              <button type="submit" disabled={isLoading} className="w-full py-3 bg-pink-400 text-white rounded-xl">
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          </TabsContent>

        </Tabs>
=======
              <div>
                <label className="block text-sm text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20"
                />
              </div>

              <div>
                <label className="block text-sm text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-white/10 text-white placeholder-white/60 border border-white/20"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {isLoading ? 'Signing up...' : 'Sign Up →'}
              </button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Bottom Text */}
        <p className="mt-6 text-center text-white/70 text-sm">
          Don’t have an account?{" "}
          <span 
            className="text-cyan-300 cursor-pointer hover:underline"
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </span>
        </p>

>>>>>>> 009318d1535891a9acec68ec599f80072a13e2d1
      </div>
    </div>
  )
}