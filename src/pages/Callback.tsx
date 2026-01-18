import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens } from '@/services/auth';
import { Background } from '@/components/layout/Background';
import { Container } from '@/components/layout/Container';
import { Card } from '@/components/ui/Card';

export function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`授權失敗：${errorParam}`);
      return;
    }

    if (!code) {
      setError('未收到授權碼');
      return;
    }

    exchangeCodeForTokens(code)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((err: Error) => {
        setError(err.message || '授權處理失敗');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <Background />

      <Container>
        <Card className="max-w-md mx-auto p-8 text-center">
          {error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-error"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">授權失敗</h1>
              <p className="text-foreground-muted mb-4">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="text-accent hover:text-accent-bright transition-colors"
              >
                返回首頁
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-accent animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-foreground mb-2">正在處理授權...</h1>
              <p className="text-foreground-muted">請稍候，即將返回 Dashboard</p>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}
