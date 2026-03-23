import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

// Auth-specific "Composited Drift" background.
// Perf model: zero SVG repaint. All motion is GPU-composited transform + opacity.
//   - Static <path> elements (no pathOffset, no pathLength — those trigger SVG repaint)
//   - motion.div animates translate x/y (composited) + opacity (composited)
//   - 2 animated containers total — the browser composites these as GPU textures
//   - 40s linear loop reads as calm, premium ambient drift
function AuthFloatingPaths({ position, delay = 0 }: { position: number; delay?: number }) {
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.04,
    strokeOpacity: 0.15 + (i / 23) * 0.15,
  }));
  return (
    <motion.div
      className="absolute inset-[-40px] pointer-events-none will-change-transform"
      animate={{
        x: [-30, 30, -30],
        y: [-15, 15, -15],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={path.strokeOpacity}
          />
        ))}
      </svg>
    </motion.div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { user, signUp, signIn, resetPassword, updatePassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [showSignInPassword, setShowSignInPassword] = React.useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = React.useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState('');
  const [isRecovery, setIsRecovery] = React.useState(false);
  const [recoveryEmail, setRecoveryEmail] = React.useState('');
  const [isInvalidToken, setIsInvalidToken] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [hasRecoverySession, setHasRecoverySession] = React.useState(false);

  // Redirect if already logged in (but never during recovery)
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const type = url.searchParams.get('type') || hashParams.get('type');
    const inRecoveryURL = type === 'recovery';
    if (user && !isRecovery && !inRecoveryURL) {
      navigate('/');
    }
  }, [user, navigate, isRecovery]);

  // Detect recovery mode from URL or auth event
  React.useEffect(() => {
    const checkRecoveryMode = async () => {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const type = url.searchParams.get('type') || hashParams.get('type');
        
        if (type === 'recovery') {
          // Enter recovery mode immediately to prevent auto-redirect
          setIsRecovery(true);
          
          // First, try to get existing session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (session?.user?.email) {
            setRecoveryEmail(session.user.email);
            setHasRecoverySession(true);
          } else {
            // If no session, try to establish one from URL tokens
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (error) {
                console.error('Failed to set recovery session:', error);
                setIsInvalidToken(true);
              } else if (data.session) {
                setRecoveryEmail(data.session.user.email || '');
                setHasRecoverySession(true);
              } else {
                setIsInvalidToken(true);
              }
            } else {
              // No tokens available, mark as invalid
              setIsInvalidToken(true);
            }
          }
        }
      } catch (err) {
        console.error('Recovery check error:', err);
        setIsInvalidToken(true);
      }
    };

    checkRecoveryMode();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
        if (session?.user?.email) {
          setRecoveryEmail(session.user.email);
          setHasRecoverySession(true);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const username = formData.get('username') as string;
    const displayName = formData.get('display-name') as string;

    const { error } = await signUp(email, password, username, displayName);

    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Welcome!',
        description: 'Your account has been created successfully.',
      });
      // Will auto-redirect via useEffect when user state updates
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
    // Will auto-redirect via useEffect when user state updates
  };


  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling to parent form
    setLoading(true);

    const { error } = await resetPassword(resetEmail);

    if (!error) {
      setForgotPasswordOpen(false);
      setResetEmail('');
    }
    setLoading(false);
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setLoading(true);

    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Update password
    const { error } = await updatePassword(newPassword);
    
    if (error) {
      // Handle specific error cases
      const errorMsg = error.message?.toLowerCase() || '';
      if (
        errorMsg.includes('auth session missing') ||
        errorMsg.includes('not authenticated') ||
        errorMsg.includes('session not found') ||
        errorMsg.includes('expired') ||
        errorMsg.includes('invalid')
      ) {
        setIsInvalidToken(true);
        toast({ 
          title: 'Session expired', 
          description: 'Please request a new password reset link.', 
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      }
      setLoading(false);
      return;
    }

    // Password updated successfully - user is now authenticated
    toast({ 
      title: 'Password updated successfully', 
      description: 'Redirecting to dashboard...' 
    });
    
    // Clean URL and redirect to dashboard
    try {
      window.history.replaceState(null, '', '/');
    } catch {}
    
    setTimeout(() => {
      navigate('/');
    }, 500);
  };

  const handleResendResetLink = async () => {
    if (!recoveryEmail && !resetEmail) {
      toast({ 
        title: 'Email required', 
        description: 'Please enter your email address.', 
        variant: 'destructive' 
      });
      return;
    }
    
    setLoading(true);
    const email = recoveryEmail || resetEmail;
    const { error } = await resetPassword(email);
    
    if (!error) {
      setIsInvalidToken(false);
      setIsRecovery(false);
      toast({ 
        title: 'Reset link sent', 
        description: 'Check your email for the new password reset link.' 
      });
    }
    setLoading(false);
  };

  const handleBackToLogin = () => {
    setIsRecovery(false);
    setIsInvalidToken(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    try {
      window.history.replaceState(null, '', '/auth');
    } catch {}
  };

  const inputClasses = "bg-white/[0.06] border-white/[0.1] text-white placeholder:text-neutral-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] focus-visible:ring-0 focus-visible:border-white/[0.18] focus-visible:bg-white/[0.08] focus-visible:ring-offset-0 transition-all duration-200";
  const labelClasses = "text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500";
  const eyeButtonClasses = "absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors";
  const ctaClasses = "w-full bg-white text-neutral-950 hover:bg-neutral-100 font-semibold border-0 h-11 shadow-[0_1px_8px_-2px_rgba(255,255,255,0.1)] hover:shadow-[0_1px_14px_-2px_rgba(255,255,255,0.18)] transition-all duration-200";

  return (
    <div className="relative isolate min-h-screen bg-neutral-950 overflow-hidden">
      {/* Layer 0: Ambient auth background — local variant, does not affect global BackgroundPaths */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AuthFloatingPaths position={1} delay={0} />
        <AuthFloatingPaths position={-1} delay={7} />
      </div>

      {/* Layer 1: Soft radial vignette — gentle center focus */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_30%,rgba(9,9,11,0.35)_70%,rgba(9,9,11,0.5)_100%)]" />

      {/* Layer 2: Auth shell — always on top, clearly centered */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Smoked glass card — paths visible through the blur */}
          <div className="relative rounded-xl bg-neutral-900/60 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_0_rgba(255,255,255,0.05),0_8px_40px_-12px_rgba(0,0,0,0.7)]">
            {/* Specular top-edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent rounded-t-xl" />

            {/* Header */}
            <div className="flex flex-col items-center pt-8 pb-1 px-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {isRecovery ? (isInvalidToken ? 'Link Expired' : 'Create New Password') : 'LR Smart Drill'}
              </h1>
              <p className="text-sm text-neutral-500 mt-2">
                {isRecovery
                  ? (isInvalidToken
                      ? 'Request a new password reset link'
                      : 'Choose a strong password for your account')
                  : 'Sign in to track your progress'}
              </p>
            </div>

            {/* Content */}
            <div className="px-8 pb-7 pt-4">
              {isRecovery ? (
                isInvalidToken ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.06] p-4">
                      <p className="text-sm text-rose-400 font-medium">
                        This password reset link is invalid or has already been used.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resend-email" className={labelClasses}>Email</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="you@example.com"
                        value={recoveryEmail || resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className={inputClasses}
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={handleResendResetLink}
                        className={ctaClasses}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Resend Reset Link'}
                      </Button>
                      <Button
                        onClick={handleBackToLogin}
                        variant="ghost"
                        className="w-full text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                        type="button"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                    {!hasRecoverySession && (
                      <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                        <p className="text-sm text-neutral-500">
                          Securely connecting your reset link...
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className={labelClasses}>New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          name="new-password"
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordError('');
                          }}
                          required
                          minLength={8}
                          className={`pr-10 ${inputClasses}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={eyeButtonClasses}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className={labelClasses}>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          name="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError('');
                          }}
                          required
                          minLength={8}
                          className={`pr-10 ${inputClasses}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className={eyeButtonClasses}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    {passwordError && (
                      <p className="text-sm text-rose-400">{passwordError}</p>
                    )}
                    <div className="space-y-2 pt-1">
                      <Button
                        type="submit"
                        className={ctaClasses}
                        disabled={loading || !hasRecoverySession}
                      >
                        {loading ? 'Updating...' : 'Save New Password'}
                      </Button>
                      <Button
                        onClick={handleBackToLogin}
                        variant="ghost"
                        className="w-full text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                        type="button"
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                )
              ) : (
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] border border-white/[0.07] rounded-lg p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]">
                    <TabsTrigger value="signin" className="rounded-md text-sm font-medium text-neutral-500 hover:text-neutral-300 data-[state=active]:bg-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.06),0_2px_5px_rgba(0,0,0,0.4)] transition-all duration-200">Sign In</TabsTrigger>
                    <TabsTrigger value="signup" className="rounded-md text-sm font-medium text-neutral-500 hover:text-neutral-300 data-[state=active]:bg-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-[0_1px_0_rgba(255,255,255,0.06),0_2px_5px_rgba(0,0,0,0.4)] transition-all duration-200">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4 pt-3">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className={labelClasses}>Email</Label>
                        <Input
                          id="signin-email"
                          name="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className={inputClasses}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className={labelClasses}>Password</Label>
                        <div className="relative">
                          <Input
                            id="signin-password"
                            name="signin-password"
                            type={showSignInPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            className={`pr-10 ${inputClasses}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                            className={eyeButtonClasses}
                            aria-label={showSignInPassword ? "Hide password" : "Show password"}
                          >
                            {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <div className="text-right -mt-1">
                        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="link" className="px-0 h-auto py-0 text-xs text-neutral-500 hover:text-neutral-300">
                              Forgot password?
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-neutral-900 border-white/[0.08]">
                            <DialogHeader>
                              <DialogTitle className="text-white">Reset Password</DialogTitle>
                              <DialogDescription className="text-neutral-500">
                                Enter your email address and we'll send you a link to reset your password.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="reset-email" className={labelClasses}>Email</Label>
                                <Input
                                  id="reset-email"
                                  type="email"
                                  placeholder="you@example.com"
                                  value={resetEmail}
                                  onChange={(e) => setResetEmail(e.target.value)}
                                  required
                                  className={inputClasses}
                                />
                              </div>
                              <Button type="submit" className={ctaClasses} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Button type="submit" className={ctaClasses} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4 pt-3">
                      <div className="space-y-2">
                        <Label htmlFor="username" className={labelClasses}>Username *</Label>
                        <Input
                          id="username"
                          name="username"
                          type="text"
                          placeholder="johndoe"
                          required
                          minLength={3}
                          maxLength={30}
                          className={inputClasses}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className={labelClasses}>Display Name</Label>
                        <Input
                          id="display-name"
                          name="display-name"
                          type="text"
                          placeholder="John Doe"
                          maxLength={50}
                          className={inputClasses}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className={labelClasses}>Email *</Label>
                        <Input
                          id="signup-email"
                          name="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          className={inputClasses}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className={labelClasses}>Password *</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            name="signup-password"
                            type={showSignUpPassword ? "text" : "password"}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            className={`pr-10 ${inputClasses}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className={eyeButtonClasses}
                            aria-label={showSignUpPassword ? "Hide password" : "Show password"}
                          >
                            {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className={ctaClasses} disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
