import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
import type { TypeChatSkeleton } from "./TypeChat";
import type { TypeDisabledSkeleton } from "./TypeDisabled";
import type { TypeHeroSkeleton } from "./TypeHero";

export interface TypePageFields {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Text;
    features?: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeChatSkeleton | TypeDisabledSkeleton | TypeHeroSkeleton>>;
}

export type TypePageSkeleton = EntrySkeletonType<TypePageFields, "page">;
export type TypePage<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePageSkeleton, Modifiers, Locales>;
