import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import { loginContent } from '../../constants/auth/content'
import { brandAssets } from '../../constants/home/content'
import { MaterialIcon } from '../shared/MaterialIcon'
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
      <div className={styles.blobs} aria-hidden="true">
        <div className={styles.blobGreen} />
        <div className={styles.blobSand} />
      </div>

      <main className={styles.main}>
        <div className={styles.card}>
          <header className={styles.header}>
            <img src={brandAssets.logo} alt={loginContent.brand} width="73" height="28" className={styles.logo} />
            <h1 className={styles.title}>{loginContent.title}</h1>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <MaterialIcon name={loginContent.emailIcon} className={styles.fieldIcon} />
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
                <MaterialIcon name={loginContent.passwordIcon} className={styles.fieldIcon} />
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
                {loading ? 'Verificando...' : loginContent.submitText}
                <MaterialIcon name={loginContent.submitIcon} style={{ fontSize: 20 }} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
