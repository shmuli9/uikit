import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef } from 'react'
import { GlassMaterial, colors } from './theme'

export function Card({ children, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container
      backgroundColor={colors.card}
      backgroundOpacity={0.8}
      borderColor={colors.card}
      borderOpacity={0.8}
      border={4}
      borderBend={0.3}
      backgroundMaterialClass={GlassMaterial}
      {...props}
    >
      <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
    </Container>
  )
}
