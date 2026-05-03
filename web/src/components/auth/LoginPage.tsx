import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import { loginContent } from '../../constants/auth/content'
import styles from './LoginPage.module.scss'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/admin')
    } else {
      setError(result.error ?? 'Login failed')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blobTop} />
      <div className={styles.blobBottom} />
      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.header}>
            <div className={styles.iconWrap}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}>
                {loginContent.adminIcon}
              </span>
            </div>
            <h1 className={styles.brand}>{loginContent.brand}</h1>
            <div className={styles.titleGroup}>
              <h2 className={styles.title}>{loginContent.title}</h2>
              <p className={styles.subtitle}>{loginContent.subtitle}</p>
            </div>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <span className={`material-symbols-outlined ${styles.fieldIcon}`}>
                  {loginContent.emailIcon}
                </span>
                <input
                  className={styles.input}
                  type="email"
                  placeholder={loginContent.emailLabel}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <span className={`material-symbols-outlined ${styles.fieldIcon}`}>
                  {loginContent.passwordIcon}
                </span>
                <input
                  className={styles.input}
                  type="password"
                  placeholder={loginContent.passwordLabel}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <button
                className={styles.submitBtn}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Checking...' : loginContent.submitText}
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {loginContent.submitIcon}
                </span>
              </button>
              <button className={styles.troubleBtn} type="button">
                {loginContent.troubleText}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
