/**
 * hooks/useApi.js — Custom React Hook for API calls
 *
 * CONCEPT — Custom Hooks:
 * A custom hook is a function starting with "use" that
 * encapsulates reusable stateful logic.
 *
 * Without this hook, every component that fetches data
 * would repeat the same pattern:
 *   const [data, setData] = useState(null)
 *   const [loading, setLoading] = useState(true)
 *   const [error, setError] = useState(null)
 *   useEffect(() => { fetch(...).then(...) }, [])
 *
 * With this hook, every component just calls:
 *   const { data, loading, error } = useApi('/api/projects')
 *
 * CONCEPT — useState:
 * useState stores a value that, when changed, causes the
 * component to re-render. It returns [value, setter].
 *
 * CONCEPT — useEffect:
 * useEffect runs side effects (like API calls) after render.
 * The second argument [] means "run once when component mounts".
 * If you put [url] it means "re-run whenever url changes".
 */
import { useState, useEffect } from 'react'

export function useApi(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    // Reset state when URL changes
    setLoading(true)
    setError(null)
    setData(null)

    // AbortController lets us cancel the fetch if the
    // component unmounts before the response arrives
    // (prevents "update on unmounted component" warnings)
    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then(json => setData(json))
      .catch(err => {
        // Ignore abort errors — they are intentional
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))

    // Cleanup: cancel fetch if component unmounts
    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}
