import { Interface } from '@ethersproject/abi'
import { FeeAmount, Pool, computePoolAddress } from '@vutien/dmm-v3-sdk'
import { Currency, Token } from '@vutien/sdk-core'
import { abi as ProAmmPoolStateABI } from 'constants/abis/v2/ProAmmPoolState.json'
import { PRO_AMM_INIT_CODE_HASH, PRO_AMM_CORE_FACTORY_ADDRESSES } from 'constants/v2'
import { useActiveWeb3React } from 'hooks'
import { useMemo } from 'react'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
export enum PoolState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID
}

const POOL_STATE_INTERFACE = new Interface(ProAmmPoolStateABI)

export function usePools(
  poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][]
): [PoolState, Pool | null][] {
  const { chainId } = useActiveWeb3React()

  const transformed: ([Token, Token, FeeAmount] | null)[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (!chainId || !currencyA || !currencyB || !feeAmount) return null

      const tokenA = currencyA?.wrapped
      const tokenB = currencyB?.wrapped
      if (!tokenA || !tokenB || tokenA.equals(tokenB)) return null
      const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
      return [token0, token1, feeAmount]
    })
  }, [chainId, poolKeys])
  const poolAddresses: (string | undefined)[] = useMemo(() => {
    const proAmmCoreFactoryAddress = chainId && PRO_AMM_CORE_FACTORY_ADDRESSES[chainId]

    return transformed.map(value => {
      if (!proAmmCoreFactoryAddress || !value) return undefined

      console.log(
        '======',
        computePoolAddress({
          factoryAddress: proAmmCoreFactoryAddress,
          tokenA: value[0],
          tokenB: value[1],
          fee: value[2],
          initCodeHashManualOverride: PRO_AMM_INIT_CODE_HASH
        })
      )
      return computePoolAddress({
        factoryAddress: proAmmCoreFactoryAddress,
        tokenA: value[0],
        tokenB: value[1],
        fee: value[2],
        initCodeHashManualOverride: PRO_AMM_INIT_CODE_HASH
      })
    })
  }, [chainId, transformed])

  const slot0s = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'getPoolState')
  const liquidities = useMultipleContractSingleData(poolAddresses, POOL_STATE_INTERFACE, 'getLiquidityState')
  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const [token0, token1, fee] = transformed[index] ?? []
      if (!token0 || !token1 || !fee) return [PoolState.INVALID, null]
      const { result: slot0, loading: slot0Loading, valid: slot0Valid } = slot0s[index]
      const { result: liquidity, loading: liquidityLoading, valid: liquidityValid } = liquidities[index]
      if (!slot0Valid || !liquidityValid) return [PoolState.INVALID, null]
      if (slot0Loading || liquidityLoading) return [PoolState.LOADING, null]

      if (!slot0 || !liquidity) return [PoolState.NOT_EXISTS, null]
      if (!slot0.sqrtP || slot0.sqrtP.eq(0)) return [PoolState.NOT_EXISTS, null]

      console.log('====poolState', poolAddresses, slot0.currentTick, slot0.sqrtP.toString(), liquidity.baseL.toString())
      try {
        return [PoolState.EXISTS, new Pool(token0, token1, fee, slot0.sqrtP, liquidity.baseL, slot0.currentTick)]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [liquidities, poolKeys, slot0s, transformed])
}

export function usePool(
  currencyA: Currency | undefined,
  currencyB: Currency | undefined,
  feeAmount: FeeAmount | undefined
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined, Currency | undefined, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount]
  )

  return usePools(poolKeys)[0]
}