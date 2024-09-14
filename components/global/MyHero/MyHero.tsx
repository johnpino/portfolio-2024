import type { FunctionalComponent } from 'vue'

import type { TypeHero } from 'contentful-types'
import type { MyHeroUIProps } from './MyHeroUIProps'
import { MyHeroUI } from '#components'

/**
 *
 * @param props The props object received by the content manager
 * @returns The Vue UI component with transformed data
 */
const MyDisabled: FunctionalComponent<TypeHero<'WITHOUT_UNRESOLVABLE_LINKS', ''>> = (
  props,
) => {
  const dataUI: MyHeroUIProps = {
    title: props.fields.title,
    subtitle: props.fields.subtitle,
    description: props.fields.description,
  }

  return (
    <MyHeroUI {...dataUI} />
  )
}

export default MyDisabled
