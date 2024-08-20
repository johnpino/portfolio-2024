import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeDisabledFields {
    heading1stRow: EntryFieldTypes.Symbol;
    heading2ndRow: EntryFieldTypes.Symbol;
    subheading: EntryFieldTypes.Symbol;
    description: EntryFieldTypes.Symbol;
}

export type TypeDisabledSkeleton = EntrySkeletonType<TypeDisabledFields, "disabled">;
export type TypeDisabled<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeDisabledSkeleton, Modifiers, Locales>;
