import React from 'react'
import { Trans } from '@lingui/macro'
import { Flex } from 'rebass'
import { useMedia } from 'react-use'

import {
  TrueSightFilterBarLayout,
  TrueSightFilterBarLayoutMobile,
  TrueSightFilterBarTitle
} from 'pages/TrueSight/styled'
import { Timeframe, TRUE_SIGHT_TABS, TrueSightFilter } from 'pages/TrueSight/index'
import TimeframePicker from 'pages/TrueSight/components/FilterBar/TimeframePicker'
import TrueSightToggle from 'pages/TrueSight/components/FilterBar/TrueSightToggle'
import useParsedQueryString from 'hooks/useParsedQueryString'
import TagSelect from 'pages/TrueSight/components/FilterBar/TagSelect'
import TokenNameSearch from 'pages/TrueSight/components/FilterBar/TokenNameSearch'

interface FilterBarProps {
  activeTab: TRUE_SIGHT_TABS | undefined
  filter: TrueSightFilter
  setFilter: React.Dispatch<React.SetStateAction<TrueSightFilter>>
}

export default function FilterBar({ activeTab, filter, setFilter }: FilterBarProps) {
  const isActiveTabTrending = activeTab === TRUE_SIGHT_TABS.TRENDING
  const above768 = useMedia('(min-width: 768px)')

  const queryString = useParsedQueryString()

  const setActiveTimeframe = (timeframe: Timeframe) => {
    setFilter(prev => ({ ...prev, timeframe }))
  }

  return above768 ? (
    <TrueSightFilterBarLayout isActiveTabTrending={isActiveTabTrending}>
      <TrueSightFilterBarTitle>
        {isActiveTabTrending ? <Trans>Currently Trending</Trans> : <Trans>Trending Soon Tokens</Trans>}
      </TrueSightFilterBarTitle>
      <TimeframePicker activeTimeframe={filter.timeframe} setActiveTimeframe={setActiveTimeframe} />
      {isActiveTabTrending && (
        <TrueSightToggle
          isActive={filter.isShowTrueSightOnly}
          toggle={() => setFilter(prev => ({ ...prev, isShowTrueSightOnly: !prev.isShowTrueSightOnly }))}
        />
      )}
      <TagSelect />
      <TokenNameSearch />
    </TrueSightFilterBarLayout>
  ) : (
    <TrueSightFilterBarLayoutMobile>
      <Flex justifyContent="space-between">
        <TrueSightFilterBarTitle>
          {isActiveTabTrending ? <Trans>Currently Trending</Trans> : <Trans>Trending Soon Tokens</Trans>}
        </TrueSightFilterBarTitle>
        {queryString.tab === 'trending' && (
          <TrueSightToggle
            isActive={filter.isShowTrueSightOnly}
            toggle={() => setFilter(prev => ({ ...prev, isShowTrueSightOnly: !prev.isShowTrueSightOnly }))}
          />
        )}
      </Flex>
      <Flex style={{ gap: '12px' }}>
        <TimeframePicker activeTimeframe={filter.timeframe} setActiveTimeframe={setActiveTimeframe} />
        <TagSelect style={{ width: '100%', flex: 1 }} />
      </Flex>
      <TokenNameSearch />
    </TrueSightFilterBarLayoutMobile>
  )
}
