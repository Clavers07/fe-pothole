import LoginForm from '@/components/ui/Auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-tobr from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">Pothole Reports</h1>
                    <p className="text-muted-foreground mt-2">Masuk untuk mengelola data</p>
                </div>
                
                <LoginForm />
            </div>
        </div>
    )
}