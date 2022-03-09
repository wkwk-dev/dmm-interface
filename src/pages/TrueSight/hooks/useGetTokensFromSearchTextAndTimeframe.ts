import { useEffect, useMemo, useState } from 'react'
import { TrueSightTimeframe } from 'pages/TrueSight/index'
import { TrueSightTokenData } from 'pages/TrueSight/hooks/useGetTrendingSoonData'

export default function useGetTokensFromSearchTextAndTimeframe(searchText: string, timeframe: TrueSightTimeframe) {
  const [data, setData] = useState<TrueSightTokenData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  useEffect(() => {
    const fetchData = async () => {
      if (searchText) {
        try {
          const timeframeStr = timeframe === TrueSightTimeframe.ONE_DAY ? '24h' : '7d'
          const url = `${
            process.env.REACT_APP_TRUESIGHT_API
          }/api/v1/trending-soon?timeframe=${timeframeStr}&page_number=${0}&page_size=${5}&search_token_name=${searchText}`
          setError(undefined)
          setIsLoading(true)
          const response = await fetch(url)
          if (response.ok) {
            const json = await response.json()
            const rawResult = json.data
            setData(rawResult.tokens ?? [])
          }
          setIsLoading(false)
        } catch (err) {
          console.error(err)
          setError(err)
          setIsLoading(false)
        }
      }
    }

    fetchData()
  }, [searchText, timeframe])

  return useMemo(() => ({ isLoading, data, error }), [data, isLoading, error])
}
