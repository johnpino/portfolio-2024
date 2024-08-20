import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

export interface TypeSkillFields {
    name: EntryFieldTypes.Symbol;
    level: EntryFieldTypes.Integer;
}

export type TypeSkillSkeleton = EntrySkeletonType<TypeSkillFields, "skill">;
export type TypeSkill<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeSkillSkeleton, Modifiers, Locales>;
