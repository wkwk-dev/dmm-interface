import React from 'react'
import { Flex } from 'rebass'

import useTheme from 'hooks/useTheme'
import { Timeframe } from 'pages/TrueSight/index'

const TimeframeToggleItem = ({ text, active, onClick }: { text: string; active: boolean; onClick: () => void }) => {
  const theme = useTheme()

  return (
    <div
      style={{
        borderRadius: '4px',
        padding: '7px',
        color: active ? theme.text14 : theme.subText,
        background: active ? theme.primary : 'transparent',
        fontSize: '12px',
        fontWeight: 500,
        lineHeight: '14.08px',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {text}
    </div>
  )
}

const TimeframeToggle = ({
  activeTimeframe,
  setActiveTimeframe
}: {
  activeTimeframe: Timeframe
  setActiveTimeframe: (timeframe: Timeframe) => void
}) => {
  const theme = useTheme()

  return (
    <Flex style={{ borderRadius: '4px', padding: '4px', background: theme.background }}>
      <TimeframeToggleItem
        text="1D"
        active={activeTimeframe === '1D'}
        onClick={() => {
          setActiveTimeframe('1D')
        }}
      />
      <TimeframeToggleItem
        text="7D"
        active={activeTimeframe === '7D'}
        onClick={() => {
          setActiveTimeframe('7D')
        }}
      />
    </Flex>
  )
}

export default TimeframeToggle
