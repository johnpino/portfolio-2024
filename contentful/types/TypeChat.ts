import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeChatFields {
    title: EntryFieldTypes.Symbol;
    send: EntryFieldTypes.Symbol;
}

export type TypeChatSkeleton = EntrySkeletonType<TypeChatFields, "chat">;
export type TypeChat<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeChatSkeleton, Modifiers, Locales>;
