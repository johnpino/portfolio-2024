import type { FunctionalComponent } from 'vue'

import { MyChatUI } from '#components'
import type { TypeChat } from 'contentful-types'
import type { MyChatUIProps } from './MyChatUIProps'

/**
 *
 * @param props The props object received by the content manager
 * @returns The Vue UI component with transformed data
 */
const MyChat: FunctionalComponent<TypeChat<'WITHOUT_UNRESOLVABLE_LINKS', ''>> = (
  props
) => {
  const dataUI: MyChatUIProps = {
    send: props.fields.send,
    initialMessage: props.fields.initialMessage,
    inputPlaceholder: props.fields.inputPlaceholder
  }

  return (
    <MyChatUI {...dataUI} />
  )
}

export default MyChat