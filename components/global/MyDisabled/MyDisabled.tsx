import type { FunctionalComponent } from 'vue'

import type { MyDisabledUIProps } from './MyDisabledUIProps'
import { MyDisabledUI } from '#components'
import type { TypeDisabled } from 'contentful-types'

/**
 *
 * @param props The props object received by the content manager
 * @returns The Vue UI component with transformed data
 */
const MyDisabled: FunctionalComponent<TypeDisabled<'WITHOUT_UNRESOLVABLE_LINKS', ''>> = (
  props
) => {
  const dataUI: MyDisabledUIProps = {
    heading1stRow: props.fields.heading1stRow,
    heading2ndRow: props.fields.heading2ndRow,
    subheading: props.fields.subheading,
    description: props.fields.description
  }

  return (
    <MyDisabledUI {...dataUI} />
  )
}

export default MyDisabled
