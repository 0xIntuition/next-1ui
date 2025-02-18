'use client'

import {
  Badge,
  Button,
  Text,
  PositionCard,
  PositionCardOwnership,
  PieChartVariant,
  PositionCardFeesAccrued,
  PositionCardStaked,
  PositionCardLastUpdated,
} from '@0xintuition/1ui'

const handleSell = () => {
  console.log('Redeem button clicked...')
}

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Intuition Next.js Template</h1>
      <p className="mb-4">This template is set up with:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Next.js 14</li>
        <li>Tailwind CSS</li>
        <li>@0xintuition/1ui components</li>
        <li>TypeScript configuration</li>
        <li>Workspace package support</li>
      </ul>
      <Button variant="primary">Primary 1ui Button Component</Button>
      <Button variant="secondary">Secondary 1ui Button Component</Button>
      <Text variant="heading1">1ui Text Component</Text>
      <Text variant="body">1ui Text Component</Text>
      <Text variant="caption">1ui Text Component</Text>
      <Text variant="footnote">1ui Text Component</Text>
      <Text variant="small">1ui Text Component</Text>
      <Badge>1ui Badge Component</Badge>
      <Badge variant="secondary">1ui Badge Component</Badge>
      <Badge variant="tertiary">1ui Badge Component</Badge>
      <Badge variant="destructive">1ui Badge Component</Badge>
      <Badge variant="success">1ui Badge Component</Badge>
      <Badge variant="warning">1ui Badge Component</Badge>
      <Badge variant="info">1ui Badge Component</Badge>
      <PositionCard onButtonClick={handleSell}>
        <PositionCardStaked amount={0.42} />
        <PositionCardOwnership percentOwnership={24} variant={PieChartVariant.default} />
        <PositionCardFeesAccrued amount={0.069} />
        <PositionCardLastUpdated timestamp="2024-04-20T11:34:59Z" />
      </PositionCard>
    </div>
  )
}
