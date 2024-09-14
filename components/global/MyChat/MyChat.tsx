import type { FunctionalComponent } from 'vue'

import type { TypeChat } from 'contentful-types'
import type { MyChatUIProps } from './MyChatUIProps'
import { MyChatUI } from '#components'

/**
 *
 * @param props The props object received by the content manager
 * @returns The Vue UI component with transformed data
 */
const MyChat: FunctionalComponent<TypeChat<'WITHOUT_UNRESOLVABLE_LINKS', ''>> = (
  props,
) => {
  const dataUI: MyChatUIProps = {
    send: props.fields.send,
    initialMessage: props.fields.initialMessage,
    inputPlaceholder: props.fields.inputPlaceholder,
    predefinedQueries: props.fields.predefinedQueries,
  }

  return (
    <MyChatUI {...dataUI} />
  )
}

export default MyChat
