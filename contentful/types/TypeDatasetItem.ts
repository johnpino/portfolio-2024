import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from 'contentful'

export interface TypeDatasetItemFields {
  content: EntryFieldTypes.Text
}

export type TypeDatasetItemSkeleton = EntrySkeletonType<TypeDatasetItemFields, 'datasetItem'>
export type TypeDatasetItem<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeDatasetItemSkeleton, Modifiers, Locales>
