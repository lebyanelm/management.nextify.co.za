import { SectionOption } from './SectionOption';
export interface Section {
    name: string;
    options: SectionOption[];
    isRequired: boolean;
    isMultiSelect: boolean;
}
